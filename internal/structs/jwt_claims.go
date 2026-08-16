package structs

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID   uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Role     string    `json:"role"`
	Email    string    `json:"email"`
	jwt.RegisteredClaims
}
