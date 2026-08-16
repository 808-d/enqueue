package services

import (
	"context"
	"enqueue/internal/database"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type CommentService struct {
	CommentRepo *database.Queries
}

func NewCommentService(CommentRepo *database.Queries) *CommentService {
	return &CommentService{CommentRepo: CommentRepo}
}

func (s *CommentService) CreateComment(ctx context.Context, userID uuid.UUID, postID uuid.UUID, content string, replyTo uuid.UUID) (database.Comment, error) {
	comment, err := s.CommentRepo.CreateComment(ctx, database.CreateCommentParams{
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
		return database.Comment{}, err
	}

	return comment, err
}

func (s *CommentService) UpdateComment(
	ctx context.Context,
	id uuid.UUID,
	content string,
) (database.Comment, error) {
	return s.CommentRepo.UpdateComment(ctx, database.UpdateCommentParams{
		ID: pgtype.UUID{
			Bytes: id,
			Valid: true,
		},
		Content: content,
	})
}

func (s *CommentService) DeleteComment(ctx context.Context, id uuid.UUID) (database.Comment, error) {
	return s.CommentRepo.DeleteComment(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
}

func (s *CommentService) GetCommentsByPost(ctx context.Context, id uuid.UUID) ([]database.Comment, error) {
	return s.CommentRepo.GetCommentsByPost(ctx, pgtype.UUID{
		Bytes: id,
		Valid: true,
	})
}
