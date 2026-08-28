
-- name: GetLike :one
SELECT user_id, post_id, create_time
FROM likes
WHERE user_id = $1
  AND post_id = $2;

-- name: CountLikes :one
SELECT COUNT(*)
FROM likes
WHERE post_id = $1;

-- name: Like :one
INSERT INTO likes
(user_id, post_id, create_time)
VALUES($1, $2, now())
  RETURNING *;


-- name: DeleteLike :one
DELETE FROM likes
WHERE user_id = $1
  AND post_id = $2
  RETURNING *;