package users

import "github.com/google/uuid"

type UpdateUserRequest struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
	Avatar   string    `json:"avatar"`
	Password string    `json:"password"`
}
