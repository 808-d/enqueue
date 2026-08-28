-- name: CreateComment :one
WITH new_comment AS (
    INSERT INTO comments
        (user_id, post_id, content, reply_to)
    VALUES
        ($1, $2, $3, $4)
    RETURNING *
)
SELECT
    c.*,
    u.avatar,
    u.username
FROM new_comment c
INNER JOIN users u
    ON c.user_id = u.id;

-- name: UpdateComment :one
WITH updated_comment AS (
    UPDATE comments
    SET
        update_time = NOW(),
        content = $2
    WHERE comments.id = $1
    RETURNING *
)
SELECT
    updated_comment.*,
    u.avatar,
    u.username
FROM updated_comment
JOIN users AS u
    ON updated_comment.user_id = u.id;

-- name: DeleteComment :one
WITH deleted_comment AS (
    UPDATE comments
    SET is_delete = true
    WHERE comments.id = $1
    RETURNING *
)
SELECT
    deleted_comment.*,
    u.avatar,
    u.username
FROM deleted_comment
JOIN users AS u
    ON deleted_comment.user_id = u.id;

-- name: GetCommentsByPost :many
select c.*,u.avatar ,u.username  from comments c
inner join users U
on c.user_id = u.id
where C.post_id  = $1 and c.is_delete = false;