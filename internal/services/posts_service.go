package services

import (
	"context"
	"enqueue/internal/database"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostService struct {
	repo *database.Queries
	db   *pgxpool.Pool
}

func NewPostService(pool *pgxpool.Pool) *PostService {
	return &PostService{repo: database.New(pool), db: pool}
}

func (s *PostService) CreatePost(ctx context.Context, title string, content string) (database.Post, error) {
	// s.db.Begin()
	return s.repo.CreatePost(ctx)

}

func (s *PostService) DeletePost(ctx context.Context, postId uuid.UUID) (database.Post, error) {
	return s.repo.UpdatePostStatus(ctx, database.UpdatePostStatusParams{
		ID: pgtype.UUID{
			Bytes: postId,
		},
		Status: 0,
	})
}

func (s *PostService) UpdatePost(ctx context.Context, postId uuid.UUID, title string, content string) (database.Post, error) {
	return s.repo.UpdatePost(ctx, database.UpdatePostParams{
		ID: pgtype.UUID{
			Bytes: postId,
			Valid: true,
		},
		Title: pgtype.Text{
			String: title,
			Valid:  true,
		},
		Content: pgtype.Text{
			String: content,
			Valid:  true,
		},
	})
}
