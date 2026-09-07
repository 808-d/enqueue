package services

import (
	"context"
	"encoding/json"
	"enqueue/internal/database"
	"enqueue/internal/ws"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DMService struct {
	repo *database.Queries
	db   *pgxpool.Pool
	hub  *ws.DirectMessageHub
}

func NewDMService(pool *pgxpool.Pool, hub *ws.DirectMessageHub) *DMService {
	return &DMService{repo: database.New(pool), db: pool, hub: hub}
}

func (s *DMService) GetMessages(ctx context.Context, cursorTime *pgtype.Timestamp, limit int32) ([]database.DirectMessage, error) {
	return s.repo.GetMessages(ctx, database.GetMessagesParams{
		CreateTime: *cursorTime,
		Limit:      limit,
	})
}

func (s *DMService) GetConversationMessages(ctx context.Context, userID, otherUserID uuid.UUID, limit int32) ([]database.DirectMessage, error) {
	return s.repo.GetConversationMessages(ctx, database.GetConversationMessagesParams{
		From:  pgtype.UUID{Bytes: userID, Valid: true},
		To:    pgtype.UUID{Bytes: otherUserID, Valid: true},
		Limit: limit,
	})
}

func (s *DMService) AddMessage(ctx context.Context, fromID uuid.UUID, toID uuid.UUID, content string) (database.DirectMessage, error) {
	msg, err := s.repo.AddMessage(ctx, database.AddMessageParams{
		From:    pgtype.UUID{Bytes: fromID, Valid: true},
		To:      pgtype.UUID{Bytes: toID, Valid: true},
		Message: pgtype.Text{String: content, Valid: true},
	})
	if err != nil {
		return database.DirectMessage{}, err
	}

	// Audit log for message creation
	s.logAudit(ctx, ActionCreate, "direct_message", fromID, nil, msg)

	// Broadcast to both participants
	if s.hub != nil {
		s.hub.PushMessage(fromID, toID, map[string]any{
			"type":    "message_created",
			"message": msg,
		})
	}

	return msg, nil
}

func (s *DMService) UpdateMessage(ctx context.Context, id uuid.UUID, content string) (database.DirectMessage, error) {
	msg, err := s.repo.UpdateMessage(ctx, database.UpdateMessageParams{
		ID:      pgtype.UUID{Bytes: id, Valid: true},
		Message: pgtype.Text{String: content, Valid: true},
	})
	if err != nil {
		return database.DirectMessage{}, err
	}

	// Audit log for message update
	s.logAudit(ctx, ActionUpdate, "direct_message", uuid.Nil, nil, msg)

	// Broadcast to both participants
	if s.hub != nil {
		s.hub.PushMessage(uuid.UUID(msg.From.Bytes), uuid.UUID(msg.To.Bytes), map[string]any{
			"type":    "message_updated",
			"message": msg,
		})
	}

	return msg, nil
}

func (s *DMService) DeleteMessage(ctx context.Context, id uuid.UUID) (database.DirectMessage, error) {
	msg, err := s.repo.DeleteMessage(ctx, pgtype.UUID{Bytes: id, Valid: true})
	if err != nil {
		return database.DirectMessage{}, err
	}

	// Audit log for message deletion (soft delete)
	s.logAudit(ctx, ActionDelete, "direct_message", uuid.Nil, nil, nil)

	// Broadcast to both participants
	if s.hub != nil {
		s.hub.PushMessage(uuid.UUID(msg.From.Bytes), uuid.UUID(msg.To.Bytes), map[string]any{
			"type":      "message_deleted",
			"messageId": msg.ID.String(),
		})
	}

	return msg, nil
}

func (s *DMService) logAudit(ctx context.Context, action Action, entity string, userID uuid.UUID, oldVal interface{}, newVal interface{}) {
	oldJSON, _ := json.Marshal(oldVal)
	newJSON, _ := json.Marshal(newVal)

	_ = s.repo.AddAuditLog(ctx, database.AddAuditLogParams{
		Action:     string(action),
		EntityName: entity,
		OldValue:   oldJSON,
		NewValue:   newJSON,
		CreateBy:   pgtype.UUID{Bytes: userID, Valid: true},
	})
}
