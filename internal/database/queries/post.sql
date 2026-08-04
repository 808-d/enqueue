-- name: CreatePost :exec
INSERT
INTO
posts
(is_delete,
  create_time,
  id,
  user_id,
  title,
  content)
VALUES(false, now(), gen_random_uuid(), $1, $2, $3);
