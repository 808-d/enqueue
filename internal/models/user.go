package models

import (
	"github.com/google/uuid"
)

type User struct {
	ID       uuid.UUID
	Username string
	Email    string
	Avatar   string
	Password string
	Role     string
	SoftDelete
	TimeLog
}
