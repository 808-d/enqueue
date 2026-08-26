-- name: CreateNotification :one
INSERT INTO notifications (recipient_id, actor_id, type, entity_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetNotification :one
SELECT * FROM notifications WHERE id = $1;

-- name: ListNotifications :many
SELECT * FROM notifications
WHERE recipient_id = $1
ORDER BY create_time DESC
LIMIT $2;

-- name: CountUnreadNotifications :one
SELECT COUNT(*) FROM notifications
WHERE recipient_id = $1 AND read_at IS NULL;

-- name: MarkNotificationRead :exec
UPDATE notifications SET read_at = now() WHERE id = $1;