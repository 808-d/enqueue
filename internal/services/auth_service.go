package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/utils"
	"errors"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type AuthService struct {
	userRepo *database.Queries
}

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func NewAuthService(userRepo *database.Queries) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) GetUserByUsernameAndPassword(
	ctx context.Context,
	username string,
	password string,
) (string, error) {
	user, err := s.userRepo.GetUserByUsernameAndPassword(
		ctx,
		database.GetUserByUsernameAndPasswordParams{
			Username: username,
			Password: pgtype.Text{
				String: utils.Hash256(&password),
				Valid:  true,
			},
		},
	)
	if err != nil {
		return "", errors.New("invalid username or password")

	}
	return GenerateToken(user.Username, user.Email, user.Role)

}

func GenerateToken(username string, email string, role string) (string, error) {
	key := os.Getenv("JWT_SECRET")
	t := jwt.New(jwt.SigningMethodHS256)
	s, err := t.SignedString(key)
	return s, err
}
