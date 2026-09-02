package services

import (
	"context"
	"encoding/json"
	"enqueue/internal/database"
	"time"

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

func (s *PostService) GetPosts(ctx context.Context, cursorTime *time.Time, cursorID *uuid.UUID, limit int32) ([]database.GetPostsRow, error) {
	var timestamp pgtype.Timestamptz
	var id pgtype.UUID

	if cursorTime != nil {
		timestamp = pgtype.Timestamptz{Time: *cursorTime, Valid: true}
	}
	if cursorID != nil {
		id = pgtype.UUID{Bytes: *cursorID, Valid: true}
	}

	return s.repo.GetPosts(ctx, database.GetPostsParams{
		Column1: timestamp,
		Column2: id,
		Limit:   limit,
	})
}

func (s *PostService) GetPostsByUser(ctx context.Context, userID uuid.UUID) ([]database.Post, error) {
	return s.repo.GetPostsByUser(ctx, pgtype.UUID{
		Bytes: userID,
		Valid: true,
	})
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

	post, err := qtx.CreatePost(ctx)
	if err != nil {
		s.logAudit(ctx, ActionCreate, EntityPost, userID, nil, post)
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
		s.logAudit(ctx, ActionCreate, EntityPost, userID, nil, err.Error())
		return database.Post{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return database.Post{}, err
	}

	s.logAudit(ctx, ActionCreate, EntityPost, userID, nil, post)

	return post, nil
}

func (s *PostService) UpdatePost(
	ctx context.Context,
	id uuid.UUID,
	title string,
	content string,
	description string,
	thumbnailUrl string,
) (database.Post, error) {
	oldPost, err := s.repo.GetPostWithOwner(ctx, pgtype.UUID{Bytes: id, Valid: true})
	if err != nil {
		return database.Post{}, err
	}

	updatedPost, err := s.repo.UpdatePost(ctx, database.UpdatePostParams{
		ID: pgtype.UUID{
			Bytes: id,
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
		Description: pgtype.Text{
			String: description,
			Valid:  true,
		},
		Thumbnail: pgtype.Text{
			String: thumbnailUrl,
			Valid:  true,
		},
	})
	if err != nil {
		s.logAudit(ctx, ActionUpdate, EntityPost, uuid.UUID(oldPost.UserID.Bytes), oldPost, err.Error())
		return database.Post{}, err
	}

	s.logAudit(ctx, ActionUpdate, EntityPost, uuid.UUID(oldPost.UserID.Bytes), oldPost, updatedPost)

	return updatedPost, nil
}

func (s *PostService) DeletePost(ctx context.Context, postId uuid.UUID) (database.Post, error) {
	oldPost, err := s.repo.GetPostWithOwner(ctx, pgtype.UUID{Bytes: postId, Valid: true})
	if err != nil {
		return database.Post{}, err
	}

	deletedPost, err := s.repo.UpdatePostStatus(ctx, database.UpdatePostStatusParams{
		ID: pgtype.UUID{
			Bytes: postId,
			Valid: true,
		},
		Status: 0,
	})
	if err != nil {
		s.logAudit(ctx, ActionDelete, EntityPost, uuid.UUID(oldPost.UserID.Bytes), oldPost, err.Error())
		return database.Post{}, err
	}

	s.logAudit(ctx, ActionUpdate, EntityPost, uuid.UUID(oldPost.UserID.Bytes), oldPost, deletedPost)

	return deletedPost, nil
}

func (s *PostService) GetPostById(ctx context.Context, postId uuid.UUID) (database.Post, []database.GetCommentsByPostRow, error) {
	post, err := s.repo.GetPostById(ctx, pgtype.UUID{
		Bytes: postId,
		Valid: true,
	})
	if err != nil {
		return database.Post{}, nil, err
	}

	comments, err := s.repo.GetCommentsByPost(ctx, database.GetCommentsByPostParams{
		PostID: pgtype.UUID{Bytes: postId, Valid: true},
		Limit:  20,
	})
	return post, comments, err
}

func (s *PostService) UpdatePostStatus(ctx context.Context, postId uuid.UUID) (database.Post, error) {
	posts, err := s.repo.UpdatePostStatus(ctx, database.UpdatePostStatusParams{
		ID: pgtype.UUID{
			Bytes: postId,
			Valid: true,
		},
	})
	if err != nil {
		return database.Post{}, err
	}
	return posts, err
}

func (s *PostService) logAudit(ctx context.Context, action Action, entity EntityName, userID uuid.UUID, oldVal interface{}, newVal interface{}) {
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
