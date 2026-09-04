-- name: AdminLogin :one
SELECT * FROM users
WHERE username = $1 AND is_delete = false AND role = 'admin' LIMIT 1;

-- name: GetTotalPosts :one
SELECT COUNT(*) FROM posts WHERE status <> 0;

-- name: GetTotalUsers :one
SELECT COUNT(*) FROM users WHERE is_delete = false AND role = 'user';

-- name: GetTotalComments :one
SELECT COUNT(*) FROM comments WHERE is_delete = false;

-- name: GetPostsOverTime :many
SELECT DATE_TRUNC('day', create_time)::timestamp AS date, COUNT(*) AS count
FROM posts
WHERE status <> 0
  AND create_time >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', create_time)
ORDER BY date;

-- name: GetUsersOverTime :many
SELECT DATE_TRUNC('day', create_time)::timestamp AS date, COUNT(*) AS count
FROM users
WHERE is_delete = false AND role = 'user'
  AND create_time >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', create_time)
ORDER BY date;

-- name: AdminListUsers :many
SELECT id, username, email, role, create_time, is_delete
FROM users
WHERE is_delete = false AND role = 'user'
ORDER BY create_time DESC
LIMIT $1 OFFSET $2;

-- name: AdminListAllUsers :many
SELECT id, username, email, role, create_time, is_delete
FROM users
WHERE role = 'user'
ORDER BY create_time DESC
LIMIT $1 OFFSET $2;

-- name: AdminCountAllUsers :one
SELECT COUNT(*) FROM users WHERE role = 'user';

-- name: ToggleUserStatus :one
UPDATE users
SET is_delete = NOT is_delete,
    update_time = now()
WHERE id = $1
RETURNING is_delete;
