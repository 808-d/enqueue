package services

import (
	"context"
	"encoding/json"
	"enqueue/internal/database"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type EntityName string

const (
	EntityPost         EntityName = "post"
	EntityLike         EntityName = "like"
	EntityRepost       EntityName = "repost"
	EntityComment      EntityName = "comment"
	EntityFollow       EntityName = "follow"
	EntityUser         EntityName = "user"
	EntityNotification EntityName = "notification"
)

type Action string

const (
	ActionCreate Action = "create"
	ActionUpdate Action = "update"
	ActionDelete Action = "delete"
)

func LogAudit(
	ctx context.Context,
	repo *database.Queries,
	action Action,
	entity EntityName,
	userID uuid.UUID,
	oldVal any,
	newVal any,
) error {
	oldJSON, _ := json.Marshal(oldVal)
	newJSON, _ := json.Marshal(newVal)

	return repo.AddAuditLog(ctx, database.AddAuditLogParams{
		Action:     string(action),
		EntityName: string(entity),
		OldValue:   oldJSON,
		NewValue:   newJSON,
		CreateBy:   pgtype.UUID{Bytes: userID, Valid: true},
	})
}
