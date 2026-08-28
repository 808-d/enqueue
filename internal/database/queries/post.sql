-- name: CreatePost :one
INSERT INTO posts (
  id,
  status
)
VALUES (
  gen_random_uuid(),
  1
)
RETURNING *;


-- name: UpdatePost :one
UPDATE posts
SET
update_time = now(),
title = $2,
content = $3,
description = $4,
thumbnail = $5
WHERE id = $1
RETURNING *;


-- name: UpdatePostStatus :one
UPDATE posts
SET
status = $2,
update_time = now()
WHERE id = $1
RETURNING *;

-- name: GetPostsByUser :many
SELECT p.* FROM posts p
INNER JOIN composes c 
ON p.id = c.post_id 
WHERE c.user_id  = $1 AND p.status <> 0
ORDER BY p.id, p.create_time;

-- name: GetPostById :one
SELECT * FROM POSTS WHERE Id = $1 AND STATUS <> 0;

-- name: GetPostWithOwner :one
SELECT p.*, c.user_id
FROM posts p
INNER JOIN composes c ON p.id = c.post_id
WHERE p.id = $1 AND p.status <> 0;
