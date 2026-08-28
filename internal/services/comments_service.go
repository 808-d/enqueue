package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/ws"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CommentService struct {
	repo    *database.Queries
	notis   *NotisService
	postHub *ws.PostHub
	db      *pgxpool.Pool
}

func NewCommentService(repo *database.Queries, notis *NotisService, postHub *ws.PostHub, db *pgxpool.Pool) *CommentService {
	return &CommentService{repo: repo, notis: notis, postHub: postHub, db: db}
}

func (s *CommentService) CreateComment(ctx context.Context, userID uuid.UUID, postID uuid.UUID, content string, replyTo uuid.UUID) (database.CreateCommentRow, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return database.CreateCommentRow{}, err
	}
	defer tx.Rollback(ctx)

	qtx := s.repo.WithTx(tx)

	comment, err := qtx.CreateComment(ctx, database.CreateCommentParams{
		UserID: pgtype.UUID{
			Bytes: userID,
			Valid: true,
		},
		PostID: pgtype.UUID{
			Bytes: postID,
			Valid: true,
		},
		Content: content,
		ReplyTo: pgtype.UUID{
			Bytes: replyTo,
			Valid: false,
		},
	})
	if err != nil {
		return database.CreateCommentRow{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return database.CreateCommentRow{}, err
	}

	// Broadcast to post hub for real-time updates
	if s.postHub != nil {
		s.postHub.BroadcastToPost(postID, map[string]any{
			"type":    "comment_created",
			"comment": comment,
		})
	}

	return comment, nil
}

func (s *CommentService) UpdateComment(
	ctx context.Context,
	id uuid.UUID,
	content string,
) (database.UpdateCommentRow, error) {
	comment, err := s.repo.UpdateComment(ctx, database.UpdateCommentParams{
		ID: pgtype.UUID{
			Bytes: id,
			Valid: true,
		},
		Content: content,
	})
	if err != nil {
		return database.UpdateCommentRow{}, err
	}

	// Broadcast to post hub for real-time updates
	if s.postHub != nil {
		postID := uuid.UUID(comment.PostID.Bytes)
		s.postHub.BroadcastCommentUpdated(postID, comment)
	}

	return comment, nil
}

func (s *CommentService) DeleteComment(ctx context.Context, id uuid.UUID) (database.DeleteCommentRow, error) {
	comment, err := s.repo.DeleteComment(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
	if err != nil {
		return database.DeleteCommentRow{}, err
	}

	// Broadcast to post hub for real-time updates
	if s.postHub != nil {
		postID := uuid.UUID(comment.PostID.Bytes)
		s.postHub.BroadcastCommentDeleted(postID, id)
	}

	return comment, nil
}

func (s *CommentService) GetCommentsByPost(ctx context.Context, id uuid.UUID) ([]database.GetCommentsByPostRow, error) {
	return s.repo.GetCommentsByPost(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
}
