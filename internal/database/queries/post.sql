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


-- name: GetPosts :many
SELECT
    p.id,
    p.title,
    p.description,
    p.thumbnail,
    EXTRACT(EPOCH FROM p.create_time)::bigint AS create_time,
    u.username,
    u.avatar,
    COALESCE(l.likes_count, 0) AS likes_count,
    COALESCE(rp.reposts_count, 0) AS reposts_count,
    COALESCE(cmt.comments_count, 0) AS comments_count,
    (COALESCE(l.likes_count, 0) * 1)
        + (COALESCE(cmt.comments_count, 0) * 5)
        + (COALESCE(rp.reposts_count, 0) * 10) AS score
FROM posts p
INNER JOIN composes c ON p.id = c.post_id
INNER JOIN users u ON c.user_id = u.id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS likes_count
    FROM likes
    GROUP BY post_id
) l ON p.id = l.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS reposts_count
    FROM reposts
    GROUP BY post_id
) rp ON p.id = rp.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS comments_count
    FROM comments
    GROUP BY post_id
) cmt ON p.id = cmt.post_id
WHERE p.status <> 0
  AND ($1::timestamptz IS NULL OR $2::uuid IS NULL OR 
       p.create_time < $1
       OR (p.create_time = $1 AND p.id < $2))
ORDER BY score DESC, p.id DESC
LIMIT $3;
