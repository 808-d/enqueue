package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"enqueue/internal/structs"
	"errors"
	"log"
	"net/smtp"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func Hash256(str string) string {
	result := sha256.Sum256([]byte(str))
	return hex.EncodeToString(result[:])
}

func SendEmail(sender, password, receiver, subject, body string) error {
	auth := smtp.PlainAuth("", sender, password, "smtp.gmail.com")

	msg := []byte(
		"From: " + sender + "\r\n" +
			"To: " + receiver + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=UTF-8\r\n" +
			"\r\n" +
			body,
	)

	return smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		sender,
		[]string{receiver},
		msg,
	)
}

func GenerateVerificationToken() (string, error) {
	bytes := make([]byte, 32)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}
func ValidateToken(tokenString string) (*structs.Claims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is not configured")
	}

	claims := &structs.Claims{}

	token, err := jwt.ParseWithClaims(
		tokenString,
		claims,
		func(token *jwt.Token) (any, error) {
			// Prevent accepting a token signed with an unexpected algorithm.
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}

			return []byte(secret), nil
		},
	)

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	if claims.UserID == uuid.Nil {
		return nil, errors.New("missing user id")
	}

	return claims, err
}

func GenerateToken(userId, username, avatar, email, role string) (string, error) {
	key := []byte(os.Getenv("JWT_SECRET"))
	log.Printf("UserID: %s, Email: %s", userId, email)
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
