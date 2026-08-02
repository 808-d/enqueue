package models

import (
	"github.com/google/uuid"
)

type Repost struct {
	UserId uuid.UUID
	PostId uuid.UUID
	TimeLog
	SoftDelete
}
