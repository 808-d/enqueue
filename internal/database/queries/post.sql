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