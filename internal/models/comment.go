package models

import (
	"github.com/google/uuid"
)

type Comment struct {
	UserId  uuid.UUID
	PostId  uuid.UUID
	Content string
	TimeLog
	SoftDelete
}
