package services

import (
	"context"
	"enqueue/internal/database"
	"errors"

	"github.com/jackc/pgx/v5/pgtype"
)

type AuthService struct {
	userRepo *database.Queries
}

func NewAuthService(userRepo *database.Queries) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) GetUserByUsernameAndPassword(
	ctx context.Context,
	username string,
	password string,
) (bool, error) {
	isExists, err := s.userRepo.GetUserByUsernameAndPassword(
		ctx,
		database.GetUserByUsernameAndPasswordParams{
			Username: username,
			Password: pgtype.Text{
				String: password,
				Valid:  true,
			},
		},
	)
	if err != nil {

	}

	if !isExists {

	}

	return false, errors.New("")
}
