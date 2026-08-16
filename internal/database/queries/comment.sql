-- name: CreateComment :one
INSERT INTO comments
    (user_id, post_id, content, reply_to)
VALUES
    ($1, $2, $3, $4)
RETURNING *;


-- name: UpdateComment :one
UPDATE comments
SET
    update_time = NOW(),
    content = $2
WHERE id = $1
RETURNING *;


-- name: DeleteComment :one
UPDATE comments
SET is_delete = true
WHERE id = $1
RETURNING *;

-- name: GetCommentsByPost :many
select * from comments c
where C.post_id  = $1 and is_delete = false;