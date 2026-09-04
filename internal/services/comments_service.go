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

	// Audit log for comment creation
	s.logAudit(ctx, ActionCreate, EntityComment, userID, nil, comment)

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

	// Audit log for comment update
	s.logAudit(ctx, ActionUpdate, EntityComment, uuid.UUID(comment.UserID.Bytes), nil, comment)

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

	// Audit log for comment deletion
	s.logAudit(ctx, ActionDelete, EntityComment, uuid.UUID(comment.UserID.Bytes), comment, nil)

	// Broadcast to post hub for real-time updates
	if s.postHub != nil {
		postID := uuid.UUID(comment.PostID.Bytes)
		s.postHub.BroadcastCommentDeleted(postID, id)
	}

	return comment, nil
}

type CommentsPageResult struct {
	Comments    []database.GetCommentsByPostRow `json:"comments"`
	TotalCount  int64                          `json:"totalCount"`
	TotalPages  int                            `json:"totalPages"`
	CurrentPage int                            `json:"currentPage"`
	PageSize    int                            `json:"pageSize"`
}

func (s *CommentService) GetCommentsByPost(ctx context.Context, postID uuid.UUID, page int, pageSize int) (CommentsPageResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	totalCount, err := s.repo.CountCommentsByPost(ctx, pgtype.UUID{Bytes: postID, Valid: true})
	if err != nil {
		return CommentsPageResult{}, err
	}

	totalPages := int((totalCount + int64(pageSize) - 1) / int64(pageSize))

	comments, err := s.repo.GetCommentsByPost(ctx, database.GetCommentsByPostParams{
		PostID: pgtype.UUID{Bytes: postID, Valid: true},
		Limit:  int32(pageSize),
		Offset: int32(offset),
	})
	if err != nil {
		return CommentsPageResult{}, err
	}

	return CommentsPageResult{
		Comments:    comments,
		TotalCount:  totalCount,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}, nil
}

func (s *CommentService) logAudit(ctx context.Context, action Action, entity EntityName, userID uuid.UUID, oldVal interface{}, newVal interface{}) {
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
