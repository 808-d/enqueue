package services

import (
	"context"
	"encoding/json"
	"enqueue/internal/database"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RepostService struct {
	repo *database.Queries
	db   *pgxpool.Pool
}

func NewRepostsSerice(pool *pgxpool.Pool) *RepostService {
	return &RepostService{repo: database.New(pool), db: pool}
}

func (s *RepostService) Repost(ctx context.Context, userID uuid.UUID, postID uuid.UUID) error {
	// Check if user already reposted
	exists, err := s.repo.CheckRepost(ctx, database.CheckRepostParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return err
	}
	if exists {
		return nil // already reposted
	}

	// Create repost
	repost, err := s.repo.Repost(ctx, database.RepostParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return err
	}

	// Audit log for repost creation
	s.logAudit(ctx, ActionCreate, EntityRepost, userID, nil, repost)

	return nil
}

func (s *RepostService) UnRepost(ctx context.Context, userID uuid.UUID, postID uuid.UUID) error {
	// Check if user has reposted
	exists, err := s.repo.CheckRepost(ctx, database.CheckRepostParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return err
	}
	if !exists {
		return nil // not reposted
	}

	// Get old value before deletion
	oldRepost, err := s.repo.CheckRepost(ctx, database.CheckRepostParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return err
	}

	// Delete repost
	_, err = s.repo.UnRepost(ctx, database.UnRepostParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return err
	}

	// Audit log for repost deletion
	s.logAudit(ctx, ActionDelete, EntityRepost, userID, oldRepost, nil)

	return nil
}

func (s *RepostService) logAudit(ctx context.Context, action Action, entity EntityName, userID uuid.UUID, oldVal interface{}, newVal interface{}) {
	oldJSON, _ := json.Marshal(oldVal)
	newJSON, _ := json.Marshal(newVal)

	_ = s.repo.AddAuditLog(ctx, database.AddAuditLogParams{
		Action:      string(action),
		EntityName:  string(entity),
		OldValue:    oldJSON,
		NewValue:    newJSON,
		CreateBy:    pgtype.UUID{Bytes: userID, Valid: true},
	})
}
