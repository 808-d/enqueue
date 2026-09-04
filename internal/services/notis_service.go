package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/dtos/notifications"
	"enqueue/internal/ws"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type NotisService struct {
	repo *database.Queries
	hub  *ws.NotificationHub
}

func NewNotisService(repo *database.Queries, hub *ws.NotificationHub) *NotisService {
	return &NotisService{repo: repo, hub: hub}
}

func buildMessage(notifType, actorUsername string) string {
	switch notifType {
	case "follow":
		return actorUsername + " started following you"
	case "like":
		return actorUsername + " liked your post"
	case "comment":
		return actorUsername + " commented on your post"
	default:
		return "You have a new notification"
	}
}

func toNotificationResponse(n database.Notification, actorUsername string) notifications.NotiResponse {
	return notifications.NotiResponse{
		ID:        n.ID.String(),
		Type:      n.Type,
		Message:   buildMessage(n.Type, actorUsername),
		EntityID:  n.EntityID.String(),
		CreatedAt: n.CreateTime.Time.Format(time.RFC3339),
	}
}

func (s *NotisService) CreateFollowNotification(ctx context.Context, recipientID, actorID uuid.UUID) (notifications.NotiResponse, error) {
	return s.create(ctx, recipientID, actorID, "follow", actorID)
}

func (s *NotisService) CreateLikeNotification(ctx context.Context, recipientID, actorID, postID uuid.UUID) (notifications.NotiResponse, error) {
	return s.create(ctx, recipientID, actorID, "like", postID)
}

func (s *NotisService) CreateCommentNotification(ctx context.Context, recipientID, actorID, postID uuid.UUID) (notifications.NotiResponse, error) {
	return s.create(ctx, recipientID, actorID, "comment", postID)
}

func (s *NotisService) create(ctx context.Context, recipientID, actorID uuid.UUID, notifType string, entityID uuid.UUID) (notifications.NotiResponse, error) {
	// don't notify yourself (e.g., liking or commenting on your own post)
	if recipientID == actorID {
		return notifications.NotiResponse{}, nil
	}

	actor, err := s.repo.GetUser(ctx, pgtype.UUID{Bytes: actorID, Valid: true})
	if err != nil {
		return notifications.NotiResponse{}, err
	}

	notif, err := s.repo.CreateNotification(ctx, database.CreateNotificationParams{
		RecipientID: pgtype.UUID{Bytes: recipientID, Valid: true},
		ActorID:     pgtype.UUID{Bytes: actorID, Valid: true},
		Type:        notifType,
		EntityID:    pgtype.UUID{Bytes: entityID, Valid: true},
	})
	if err != nil {
		return notifications.NotiResponse{}, err
	}

	resp := toNotificationResponse(notif, actor.Username)

	// live push — best effort, doesn't fail the request if recipient isn't connected
	s.hub.PushToUser(recipientID, resp)

	return resp, nil
}

func (s *NotisService) GetNotifications(ctx context.Context, userID uuid.UUID) ([]notifications.NotiResponse, error) {
	notificationsList, err := s.repo.ListNotifications(ctx, database.ListNotificationsParams{
		RecipientID: pgtype.UUID{Bytes: userID, Valid: true},
		Limit:       50,
	})
	log.Printf("ListNotifications recipient_id=%v",
		userID,
	)
	if err != nil {
		return nil, err
	}

	var result []notifications.NotiResponse
	for _, n := range notificationsList {
		actor, err := s.repo.GetUser(ctx, pgtype.UUID{Bytes: n.ActorID.Bytes, Valid: true})
		if err != nil {
			continue
		}
		result = append(result, toNotificationResponse(n, actor.Username))
	}

	return result, nil
}

func (s *NotisService) GetUnreadCount(ctx context.Context, userID uuid.UUID) (int64, error) {
	return s.repo.CountUnreadNotifications(ctx, pgtype.UUID{Bytes: userID, Valid: true})
}

func (s *NotisService) MarkAsRead(ctx context.Context, userID, notificationID uuid.UUID) error {
	// Verify the notification belongs to the user
	notif, err := s.repo.GetNotification(ctx, pgtype.UUID{Bytes: notificationID, Valid: true})
	if err != nil {
		return err
	}
	if notif.RecipientID.Bytes != userID {
		return nil // silently ignore
	}
	return s.repo.MarkNotificationRead(ctx, pgtype.UUID{Bytes: notificationID, Valid: true})
}

func (s *NotisService) MarkAllAsRead(ctx context.Context, userID uuid.UUID) error {
	notificationsList, err := s.repo.ListNotifications(ctx, database.ListNotificationsParams{
		RecipientID: pgtype.UUID{Bytes: userID, Valid: true},
		Limit:       1000,
	})
	if err != nil {
		return err
	}

	for _, n := range notificationsList {
		if n.ReadAt.Valid {
			continue
		}
		if err := s.repo.MarkNotificationRead(ctx, n.ID); err != nil {
			return err
		}
	}
	return nil
}
