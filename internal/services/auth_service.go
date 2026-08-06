package services

import (
	"context"
	"enqueue/internal/database"
	"errors"
	"os"
	"time"

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
				String: password,
				Valid:  true,
			},
		},
	)
	if err != nil {
		return "", errors.New("invalid username or password")

	}
	return GenerateToken(user.Username, user.Email, user.Role)

}

func GenerateToken(username, email, role string) (string, error) {
	key := []byte(os.Getenv("JWT_SECRET"))

	claims := jwt.MapClaims{
		"username": username,
		"email":    email,
		"role":     role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(key)
}
