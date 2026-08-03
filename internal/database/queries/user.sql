-- name: GetUser :one
SELECT * FROM public."users" WHERE id = $1 LIMIT 1;

-- name: ListUsers :many
SELECT * FROM public."users" WHERE is_delete = false ORDER BY id;

-- name: CreateUser :one
INSERT INTO public."users"
(id, username, email, avatar, password, role, is_delete, create_time, update_time)
VALUES (gen_random_uuid(), $1, $2, $3, $4, 'user', false, now(), now())
RETURNING *;

-- name: UpdateUser :one
UPDATE public."users"
SET email = $2,
avatar = $3,
password = $4,
update_time = now()
WHERE id = $1 AND is_delete = false
RETURNING *;

-- name: DeleteUser :exec
UPDATE public."users"
SET is_delete = true,
update_time = now()
WHERE id = $1;
