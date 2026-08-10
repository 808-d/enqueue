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

func (s *PostService) CreatePost(
	ctx context.Context,
	userID uuid.UUID,
) (database.Post, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return database.Post{}, err
	}
	defer tx.Rollback(ctx)

	qtx := s.repo.WithTx(tx)
	// create empty post
	post, err := qtx.CreatePost(ctx)
	if err != nil {
		return database.Post{}, err
	}

	err = qtx.CreateCompose(ctx, database.CreateComposeParams{
		UserID: pgtype.UUID{
			Bytes: userID,
			Valid: true,
		},
		PostID: post.ID,
	})
	if err != nil {
		return database.Post{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return database.Post{}, err
	}

	return post, nil
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
