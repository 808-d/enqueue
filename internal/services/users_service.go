package services

import (
	"context"
	"enqueue/internal/database"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type UserService struct {
	userRepo *database.Queries
}

func NewUserService(userRepo *database.Queries) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetUsers(ctx context.Context) ([]database.User, error) {
	return s.userRepo.ListUsers(ctx)
}

func (s *UserService) CreateUser(ctx context.Context, username string, email string, password string) {
	s.userRepo.CreateUser(ctx, database.CreateUserParams{
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
	avatar string,
	email string,
	password string,
) (database.User, error) {
	return s.userRepo.UpdateUser(ctx, database.UpdateUserParams{
		ID: pgtype.UUID{
			Bytes: id,
			Valid: true,
		},
		Username: username,
		Email:    email,
		Avatar: pgtype.Text{
			String: avatar,
			Valid:  true,
		},
		Password: pgtype.Text{
			String: password,
			Valid:  true,
		},
	})
}

func (s *UserService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return s.userRepo.DeleteUser(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
}

func (s *UserService) GetUser(ctx context.Context, id uuid.UUID) (database.User, error) {
	return s.userRepo.GetUser(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
}
