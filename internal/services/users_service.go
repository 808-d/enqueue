package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/dtos/users"
	"enqueue/internal/utils"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo *database.Queries
	db   *pgxpool.Pool
	rdb  *redis.Client
}

func NewUserService(pool *pgxpool.Pool, rdb *redis.Client) *UserService {
	return &UserService{repo: database.New(pool), db: pool, rdb: rdb}
}

func (s *UserService) GetUsers(ctx context.Context) ([]database.User, error) {
	return s.repo.ListUsers(ctx)
}

func (s *UserService) CreateUser(ctx context.Context, username string, email string, password string) {
	s.repo.CreateUser(ctx, database.CreateUserParams{
		Username: username,
		Email:    email,
		Password: pgtype.Text{
			String: password,
			Valid:  true,
		},
	})
}

func (s *UserService) UpdateUser(
	ctx context.Context,
	id uuid.UUID,
	username string,
	name string,
	avatar string,
	bio string,
	email string,
) (string, users.UserResponse, bool, error) {
	currentUser, err := s.GetUser(ctx, id)
	if err != nil {
		return "", users.UserResponse{}, false, err
	}

	emailChanged := currentUser.Email != email

	updatedUser, err := s.repo.UpdateUserNotIncludeEmail(ctx, database.UpdateUserNotIncludeEmailParams{
		ID:       pgtype.UUID{Bytes: id, Valid: true},
		Username: username,
		Avatar:   pgtype.Text{String: avatar, Valid: true},
		Name:     pgtype.Text{String: name, Valid: true},
		Bio:      pgtype.Text{String: bio, Valid: true},
	})
	if err != nil {
		return "", users.UserResponse{}, false, err
	}

	if emailChanged {
		if err := s.RequestEmailChange(ctx, id, email); err != nil {
			return "", users.UserResponse{}, false, err
		}
	}

	token, err := utils.GenerateToken(
		updatedUser.ID.String(),
		updatedUser.Username,
		updatedUser.Email,
		updatedUser.Role,
	)
	if err != nil {
		return "", users.UserResponse{}, false, err
	}

	return token, toUserResponse(updatedUser), emailChanged, nil
}

func (s *UserService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return s.repo.DeleteUser(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
}

func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (database.User, error) {
	return s.repo.GetUser(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
}

func (s *UserService) GetCurrentUser(ctx context.Context, id uuid.UUID) (users.UserResponse, error) {
	user, err := s.repo.GetUser(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
	if err != nil {
		return users.UserResponse{}, err
	}

	return toUserResponse(user), nil
}

func (s *UserService) RequestEmailChange(ctx context.Context, id uuid.UUID, email string) error {
	if err := s.repo.AddPendingEmail(ctx, database.AddPendingEmailParams{
		ID:           pgtype.UUID{Bytes: id, Valid: true},
		PendingEmail: pgtype.Text{String: email, Valid: true},
	}); err != nil {
		return err
	}

	token, err := utils.GenerateVerificationToken()
	if err != nil {
		return err
	}

	if err := s.rdb.Set(ctx, "verify_email:"+token, id.String(), time.Minute*15).Err(); err != nil {
		return err
	}

	return utils.SendEmail(
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("APP_PASSWORD"),
		email,
		"Confirm your new Enqueue email",
		fmt.Sprintf(`Hi,

		You requested to change your Enqueue account email to this address.
		Please click the link below to confirm the change:

		%s/verify-email-change?token=%s

		If you didn't request this, you can safely ignore this email — your account email will not change.

		Thanks,
		The Enqueue team`, os.Getenv("FRONTEND_URL"), token),
	)
}

func toUserResponse(u database.User) users.UserResponse {
	return users.UserResponse{
		ID:       u.ID.String(), // adjust based on your actual pgtype.UUID -> string conversion
		Username: u.Username,
		Name:     u.Name.String,
		Email:    u.Email,
		Avatar:   u.Avatar.String,
		Bio:      u.Bio.String,
	}
}

func (s *UserService) ChangePassword(
	ctx context.Context,
	userID uuid.UUID,
	currentPassword string,
	newPassword string,
) error {
	user, err := s.repo.GetUser(ctx, pgtype.UUID{
		Bytes: userID,
		Valid: true,
	})
	if err != nil {
		return err
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password.String),
		[]byte(currentPassword),
	); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	newHash, err := bcrypt.GenerateFromPassword(
		[]byte(newPassword),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	// Save new hash
	return s.repo.UpdatePassword(ctx, database.UpdatePasswordParams{
		ID: pgtype.UUID{
			Bytes: userID,
			Valid: true,
		},
		Password: pgtype.Text{
			String: string(newHash),
			Valid:  true,
		},
	})
}
