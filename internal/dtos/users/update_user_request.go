package users

import "github.com/google/uuid"

type UpdateUserRequest struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Name     string    `json:"name"`
	Email    string    `json:"email"`
	Avatar   string    `json:"avatar"`
	Bio      string    `json:"bio"`
}
