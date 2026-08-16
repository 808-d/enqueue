-- name: FollowUser :exec
INSERT INTO follows (follower_id, following_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: UnfollowUser :exec
DELETE FROM follows WHERE follower_id = $1 AND following_id = $2;

-- name: IsFollowing :one
SELECT EXISTS (
  SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2
);

-- name: GetFollowing :many
SELECT u.* FROM users u
JOIN follows f ON f.following_id = u.id
WHERE f.follower_id = $1 AND u.is_delete = false
ORDER BY f.create_time DESC;

-- name: GetFollowers :many
SELECT u.* FROM users u
JOIN follows f ON f.follower_id = u.id
WHERE f.following_id = $1 AND u.is_delete = false
ORDER BY f.create_time DESC;

-- name: CountFollowing :one
SELECT COUNT(*) FROM follows WHERE follower_id = $1;

-- name: CountFollowers :one
SELECT COUNT(*) FROM follows WHERE following_id = $1;