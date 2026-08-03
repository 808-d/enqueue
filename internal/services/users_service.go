package services

import (
	"context"
	"enqueue/internal/database"
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
