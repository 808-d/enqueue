package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/utils"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"enqueue/internal/structs"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo *database.Queries
	db   *pgxpool.Pool
	rdb  *redis.Client
}

func (s *AuthService) ValidateSignUpRequest(context context.Context, username string, email string) (bool, error) {
	isExists, err := s.repo.UserExistsByUsernameOrEmail(
		context,
		database.UserExistsByUsernameOrEmailParams{
			Username: username,
			Email:    email,
		},
	)
	if err != nil {
		return false, err
	}
	return !isExists, nil
}

func NewAuthService(pool *pgxpool.Pool, rdb *redis.Client) *AuthService {
	return &AuthService{repo: database.New(pool), db: pool, rdb: rdb}
}

func (s *AuthService) GetToken(
	ctx context.Context,
	username string,
	password string,
) (string, error) {

	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return "", errors.New("invalid username or password")
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword(
		[]byte(password),
		[]byte(user.Password.String),
	); err != nil {
		return "", errors.New("invalid username or password")
	}

	return utils.GenerateToken(user.ID.String(), user.Username, user.Email, user.Role)

}

func (s *AuthService) CreateUser(ctx context.Context, username string, email string, password string) (pgtype.UUID, error) {
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return pgtype.UUID{}, err
	}
	id, err := s.repo.CreateUser(ctx, database.CreateUserParams{
		Username: username,
		Email:    email,
		Password: pgtype.Text{
			String: hashedPassword,
			Valid:  true,
		},
	})
	return id, err
}

func (s *AuthService) Signup(ctx context.Context, username string, email string, password string) error {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	qtx := s.repo.WithTx(tx)
	// check user name or email exist
	isValid, err := s.ValidateSignUpRequest(ctx, username, email)
	if err != nil {
		log.Printf("Validation error: %v\n", err)
		return err
	}
	if !isValid {
		return err
	}

	// create user / with email_verified = false
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return err
	}
	userId, err := qtx.CreateUser(ctx, database.CreateUserParams{
		Username: username,
		Email:    email,
		Password: pgtype.Text{
			String: hashedPassword,
			Valid:  true,
		},
	})
	if err != nil {
		return err
	}

	// send verification code
	token, err := utils.GenerateVerificationToken()
	if err != nil {
		return err
	}

	if err := s.rdb.Set(ctx, "verify_email:"+token, userId, time.Minute*15).Err(); err != nil {
		return err
	}

	utils.SendEmail(
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("APP_PASSWORD"),
		email,
		"Verify your Enqueue email",
		fmt.Sprintf(`Welcome to Enqueue!
		Thank you for signing up!
		Please click the link below to verify your email address:
		%s/verify?token=%s
		If you didn't create an Enqueue account, you can safely ignore this email.
		Thanks,
		The Enqueue team`, os.Getenv("FRONTEND_URL"), token),
	)

	return tx.Commit(ctx)
}

func (s *AuthService) Verify(ctx context.Context, token string) (bool, error) {
	token, err := s.rdb.Get(ctx, "verify_email:"+token).Result()
	if err != nil {
		panic(err)
	}
	// update email
	return token != "", nil
}

func (s *AuthService) VerifyEmailChange(ctx context.Context, token string) (string, error) {
	val, err := s.rdb.Get(ctx, "verify_email:"+token).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", err
		}
		return "", err
	}

	userID, err := uuid.Parse(val)
	if err != nil {
		return "", err
	}

	updatedUser, err := s.repo.ConfirmEmailChange(ctx, pgtype.UUID{
		Bytes: userID,
		Valid: true,
	})
	if err != nil {
		return "", err
	}

	// token is single-use — invalidate it now that it's been consumed
	if err := s.rdb.Del(ctx, "verify_email:"+token).Err(); err != nil {
		return "", err
	}

	newToken, err := utils.GenerateToken(
		updatedUser.ID.String(),
		updatedUser.Username,
		updatedUser.Email,
		updatedUser.Role,
	)
	if err != nil {
		return "", err
	}

	return newToken, nil
}

func (s *AuthService) DecodeToken(tokenString string) (*structs.Claims, error) {
	token, err := utils.ValidateToken(tokenString)
	if err != nil {
		return nil, errors.New("invalid token")
	}
	return token, err
}

func (s *AuthService) RequestPasswordReset(ctx context.Context, username string) error {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		// user not found — silently return nil so the handler's generic response holds
		return nil
	}

	token, err := utils.GenerateVerificationToken()
	if err != nil {
		return err
	}

	if err := s.rdb.Set(ctx, "reset_password:"+token, user.ID.Bytes, time.Minute*15).Err(); err != nil {
		return err
	}

	return utils.SendEmail(
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("APP_PASSWORD"),
		user.Email,
		"Reset your Enqueue password",
		fmt.Sprintf(`Hi,

We received a request to reset your Enqueue password. Click the link below to choose a new one:

%s/reset-password?token=%s

If you didn't request this, you can safely ignore this email — your password will not change.

This link expires in 15 minutes.

Thanks,
The Enqueue team`, os.Getenv("FRONTEND_URL"), token),
	)
}
