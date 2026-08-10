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

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthService struct {
	repo *database.Queries
	db   *pgxpool.Pool
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

func NewAuthService(pool *pgxpool.Pool) *AuthService {
	return &AuthService{repo: database.New(pool), db: pool}
}

func (s *AuthService) GetToken(
	ctx context.Context,
	username string,
	password string,
) (string, error) {

	hashedPassword := utils.Hash256(password)
	user, err := s.repo.GetUserByUsernameAndPassword(
		ctx,
		database.GetUserByUsernameAndPasswordParams{
			Username: username,
			Password: pgtype.Text{
				String: hashedPassword,
				Valid:  true,
			},
		},
	)
	if err != nil {
		return "", errors.New("invalid username or password")

	}
	return GenerateToken(user.ID.String(), user.Username, user.Avatar.String, user.Email, user.Role)

}

func GenerateToken(userId, username, avatar, email, role string) (string, error) {
	key := []byte(os.Getenv("JWT_SECRET"))
	log.Printf("UserID: %s", userId)
	claims := jwt.MapClaims{
		"id":       userId,
		"username": username,
		"avatar":   avatar,
		"email":    email,
		"role":     role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(key)
}

func (s *AuthService) CreateUser(ctx context.Context, username string, email string, password string) (pgtype.UUID, error) {
	hashedPassword := utils.Hash256(password)
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

func (s *AuthService) Signup(context context.Context, username string, email string, password string) error {
	tx, err := s.db.Begin(context)
	if err != nil {
		return err
	}
	defer tx.Rollback(context)

	qtx := s.repo.WithTx(tx)
	// check user name or email exist
	isValid, err := s.ValidateSignUpRequest(context, username, email)
	if err != nil {
		log.Printf("Validation error: %v\n", err)
		return err
	}
	if !isValid {
		return err
	}

	// create user / with email_verified = false
	hashedPassword := utils.Hash256(password)
	userId, err := qtx.CreateUser(context, database.CreateUserParams{
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

	err = qtx.CreateEmailVerification(context, database.CreateEmailVerificationParams{
		UserID: userId,
		Token:  token,
		ExpiresAt: pgtype.Timestamptz{
			Time:  time.Now().Add(5 * time.Minute),
			Valid: true,
		},
	})
	if err != nil {
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

	return tx.Commit(context)
}

func (s *AuthService) Verify(ctx context.Context, token string) (bool, error) {
	userID, err := s.repo.CheckVerify(ctx, token)
	if err != nil {
		return false, err
	}

	err = s.repo.VerifyUser(ctx, userID)
	if err != nil {
		return false, err
	}

	err = s.repo.DeleteToken(ctx, token)
	if err != nil {
		return false, err
	}
	return true, nil
}

func (s *AuthService) DecodeToken(tokenString string) (*structs.Claims, error) {
	token, err := utils.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	if err != nil {
		return nil, errors.New("invalid token")
	}
	return token, err
}
