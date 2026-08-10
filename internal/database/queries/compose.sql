
-- name: CreateCompose :exec  
INSERT INTO composes
(user_id, post_id)
VALUES($1, $2);