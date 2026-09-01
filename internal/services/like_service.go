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

type LikeService struct {
	repo  *database.Queries
	db    *pgxpool.Pool
	notis *NotisService
}

func NewLikeService(repo *database.Queries, notiHub *ws.NotificationHub, db *pgxpool.Pool) *LikeService {
	return &LikeService{
		repo:  repo,
		db:    db,
		notis: NewNotisService(repo, notiHub),
	}
}

func (s *LikeService) LikePost(ctx context.Context, userID, postID uuid.UUID) (database.Like, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return database.Like{}, err
	}
	defer tx.Rollback(ctx)

	qtx := s.repo.WithTx(tx)

	// Check if already liked
	existing, err := qtx.GetLike(ctx, database.GetLikeParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err == nil && (existing.UserID.Valid || existing.PostID.Valid) {
		return existing, nil // already liked
	}

	like, err := qtx.Like(ctx, database.LikeParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return database.Like{}, err
	}

	// Get post owner to send notification
	post, err := qtx.GetPostWithOwner(ctx, pgtype.UUID{Bytes: postID, Valid: true})
	if err != nil {
		return database.Like{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return database.Like{}, err
	}

	// Audit log for like creation
	s.logAudit(ctx, ActionCreate, EntityLike, userID, nil, like)

	// Send notification to post owner (if not self-like) via NotisService
	if post.UserID.Bytes != userID {
		s.notis.CreateLikeNotification(ctx, uuid.UUID(post.UserID.Bytes), userID, postID)
	}

	return like, nil
}

func (s *LikeService) UnlikePost(ctx context.Context, userID, postID uuid.UUID) error {
	// Get old value before deletion
	oldLike, err := s.repo.GetLike(ctx, database.GetLikeParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return err
	}

	_, err = s.repo.DeleteLike(ctx, database.DeleteLikeParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return err
	}

	// Audit log for like deletion
	s.logAudit(ctx, ActionDelete, EntityLike, userID, oldLike, nil)

	return nil
}

func (s *LikeService) GetLikeCount(ctx context.Context, postID uuid.UUID) (int64, error) {
	return s.repo.CountLikes(ctx, pgtype.UUID{Bytes: postID, Valid: true})
}

func (s *LikeService) HasUserLiked(ctx context.Context, userID, postID uuid.UUID) (bool, error) {
	_, err := s.repo.GetLike(ctx, database.GetLikeParams{
		UserID: pgtype.UUID{Bytes: userID, Valid: true},
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
	})
	if err != nil {
		return false, nil
	}
	return true, nil
}

func (s *LikeService) logAudit(ctx context.Context, action Action, entity EntityName, userID uuid.UUID, oldVal interface{}, newVal interface{}) {
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
