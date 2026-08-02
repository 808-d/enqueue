package models

import (
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID         uuid.UUID
	Action     string
	EntityName string
	OldValue   string
	NewValue   string
	CreatedBy  uuid.UUID
	CreateTime time.Time
}
