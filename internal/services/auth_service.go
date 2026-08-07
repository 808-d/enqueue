package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/utils"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type AuthService struct {
	userRepo *database.Queries
}

func (s *AuthService) ValidateSignUpRequest(context context.Context, username string, email string) (bool, error) {
	isExists, err := s.userRepo.UserExistsByUsernameOrEmail(
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

type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func NewAuthService(userRepo *database.Queries) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) GetToken(
	ctx context.Context,
	username string,
	password string,
) (string, error) {

	hashedPassword := utils.Hash256(password)
	user, err := s.userRepo.GetUserByUsernameAndPassword(
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
	return GenerateToken(user.Username, user.Avatar.String, user.Email, user.Role)

}

func GenerateToken(username, avatar, email, role string) (string, error) {
	key := []byte(os.Getenv("JWT_SECRET"))

	claims := jwt.MapClaims{
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

func (s *AuthService) CreateUser(ctx context.Context, username string, email string, password string) error {
	hashedPassword := utils.Hash256(password)
	err := s.userRepo.CreateUser(ctx, database.CreateUserParams{
		Username: username,
		Email:    email,
		Password: pgtype.Text{
			String: hashedPassword,
			Valid:  true,
		},
	})
	return err

}
