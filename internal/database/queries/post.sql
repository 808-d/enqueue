-- name: CreatePost :one
INSERT
INTO
posts
(is_delete,
  create_time,
  id,
  title,
  content)
VALUES(false, now(), gen_random_uuid(), $1, $2)
RETURNING *;

-- name: UpdatePost :one

UPDATE
posts
SET
update_time = now(),
title = $2,
"content" = $3
WHERE
id = $1
RETURNING *;

-- name: DeletePost :exec
DELETE
FROM
posts
WHERE
id = $1;
