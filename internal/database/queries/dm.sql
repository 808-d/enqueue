-- name: GetMessages :many
SELECT is_delete, create_time, update_time, id, "from", "to", message
FROM direct_messages dm
WHERE dm.create_time < $1
LIMIT $2;

-- name: AddMessage :one
INSERT INTO direct_messages
("from", "to", message)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateMessage :one
UPDATE public.direct_messages
SET update_time=NOW(), message=$2
WHERE id=$1
RETURNING *;

-- name: DeleteMessage :one
UPDATE public.direct_messages
SET update_time=NOW(), is_delete = true
WHERE id=$1
RETURNING *;

-- name: GetConversationMessages :many
SELECT dm.*
FROM direct_messages dm
WHERE ((dm."from" = $1 AND dm."to" = $2) OR (dm."from" = $2 AND dm."to" = $1))
  AND dm.is_delete = false
ORDER BY dm.create_time ASC
LIMIT $3;

