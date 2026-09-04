-- name: Repost :one 
INSERT INTO public.reposts
(user_id, post_id)
VALUES($1, $2)
RETURNING *;
-- name: UnRepost :one
DELETE FROM public.reposts
WHERE user_id=$1 AND post_id=$2
RETURNING *;
-- name: CheckRepost :one
SELECT EXISTS (
  SELECT 1 FROM reposts
WHERE user_id=$1 AND post_id=$2
);
