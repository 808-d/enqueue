package models

import (
	"time"

	"github.com/google/uuid"
)

type Like struct {
	UserId     uuid.UUID
	PostId     uuid.UUID
	CreateTime time.Time
}
