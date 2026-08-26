package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/dtos/notifications"
	"enqueue/internal/ws"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type FollowsService struct {
	repo  *database.Queries
	db    *pgxpool.Pool
	notis *NotisService
}

func NewFollowsService(pool *pgxpool.Pool, hub *ws.NotificationHub) *FollowsService {
	repo := database.New(pool)
	return &FollowsService{
		repo:  repo,
		db:    pool,
		notis: NewNotisService(repo, hub),
	}
}

func (s *FollowsService) FollowUser(ctx context.Context, followerID, followingID uuid.UUID) (notifications.NotiResponse, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return notifications.NotiResponse{}, err
	}
	defer tx.Rollback(ctx)

	qtx := s.repo.WithTx(tx)

	// Add follow relationship
	err = qtx.FollowUser(ctx, database.FollowUserParams{
		FollowerID: pgtype.UUID{
			Bytes: followerID,
			Valid: true,
		},
		FollowingID: pgtype.UUID{
			Bytes: followingID,
			Valid: true,
		},
	})
	if err != nil {
		return notifications.NotiResponse{}, err
	}

	// Create follow notification
	notif, err := s.notis.CreateFollowNotification(ctx, followingID, followerID)
	if err != nil {
		return notifications.NotiResponse{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return notifications.NotiResponse{}, err
	}

	return notif, nil
}

func (s *FollowsService) UnfollowUser(ctx context.Context, followerID, followingID uuid.UUID) error {
	return s.repo.UnfollowUser(ctx, database.UnfollowUserParams{
		FollowerID: pgtype.UUID{
			Bytes: followerID,
			Valid: true,
		},
		FollowingID: pgtype.UUID{
			Bytes: followingID,
			Valid: true,
		},
	})
}

func (s *FollowsService) GetFollowers(ctx context.Context, userID uuid.UUID) ([]database.User, error) {
	return s.repo.GetFollowers(ctx, pgtype.UUID{
		Bytes: userID,
		Valid: true,
	})
}

func (s *FollowsService) GetFollowing(ctx context.Context, userID uuid.UUID) ([]database.User, error) {
	return s.repo.GetFollowing(ctx, pgtype.UUID{
		Bytes: userID,
		Valid: true,
	})
}

func (s *FollowsService) IsFollowing(ctx context.Context, followerID, followingID uuid.UUID) (bool, error) {
	return s.repo.IsFollowing(ctx, database.IsFollowingParams{
		FollowerID: pgtype.UUID{
			Bytes: followerID,
			Valid: true,
		},
		FollowingID: pgtype.UUID{
			Bytes: followingID,
			Valid: true,
		},
	})
}

func (s *FollowsService) CountFollowers(ctx context.Context, userID uuid.UUID) (int64, error) {
	return s.repo.CountFollowers(ctx, pgtype.UUID{
		Bytes: userID,
		Valid: true,
	})
}

func (s *FollowsService) CountFollowing(ctx context.Context, userID uuid.UUID) (int64, error) {
	return s.repo.CountFollowing(ctx, pgtype.UUID{
		Bytes: userID,
		Valid: true,
	})
}
