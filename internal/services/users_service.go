package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/utils"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
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
) (string, error) {
	token := ""
	user, err := s.GetUser(ctx, id)
	if err != nil {
		return "", err
	}

	if user.Email != email {
		err = s.RequestEmailChange(ctx, id, pgtype.Text{
			String: email,
			Valid:  true,
		})
	} else {
		user, err := s.repo.UpdateUserNotIncludeEmail(ctx, database.UpdateUserNotIncludeEmailParams{
			ID: pgtype.UUID{
				Bytes: id,
				Valid: true,
			},
			Username: username,
			Avatar: pgtype.Text{
				String: avatar,
				Valid:  true,
			},
			Name: pgtype.Text{
				String: name,
				Valid:  true,
			},
			Bio: pgtype.Text{
				String: bio,
				Valid:  true,
			},
		})
		if err != nil {
			return "", err
		}

		token, err = utils.GenerateToken(user.ID.String(), user.Username, user.Avatar.String, user.Email, user.Role)
	}
	return token, err

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

func (s *UserService) RequestEmailChange(ctx context.Context, id uuid.UUID, email pgtype.Text) error {
	err := s.repo.AddPendingEmail(ctx, database.AddPendingEmailParams{
		ID: pgtype.UUID{
			Bytes: id,
			Valid: true,
		},
		PendingEmail: email,
	})
	if err != nil {
		return err
	}
	token, err := utils.GenerateVerificationToken()
	if err != nil {
		return err
	}

	err = s.rdb.Set(ctx, "verify_email:"+token, id.String(), time.Minute*15).Err()
	if err != nil {
		return err
	}

	return utils.SendEmail(
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("APP_PASSWORD"),
		email.String,
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
