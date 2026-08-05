package services

import (
	"context"
	"enqueue/internal/database"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type PostService struct {
	postRepo *database.Queries
}

func NewPostService(postRepo *database.Queries) *PostService {
	return &PostService{postRepo: postRepo}
}

func (s *PostService) CreatePost(ctx context.Context, title string, content string) (database.Post, error) {
	return s.postRepo.CreatePost(ctx, database.CreatePostParams{
		Title: title,
		Content: pgtype.Text{
			String: content,
			Valid:  true,
		},
	})

}

func (s *PostService) DeletePost(ctx context.Context, postId uuid.UUID) error {
	return s.postRepo.DeletePost(ctx, pgtype.UUID{
		Bytes: postId,
		Valid: true,
	})
}

func (s *PostService) UpdatePost(ctx context.Context, postId uuid.UUID, title string, content string) (database.Post, error) {
	return s.postRepo.UpdatePost(ctx, database.UpdatePostParams{
		ID: pgtype.UUID{
			Bytes: postId,
			Valid: true,
		},
		Title: title,
		Content: pgtype.Text{
			String: content,
			Valid:  true,
		},
	})
}
