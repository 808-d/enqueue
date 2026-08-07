-- name: GetUser :one
SELECT * FROM users WHERE id = $1 AND is_delete = false LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users WHERE is_delete = false and role = 'user' ORDER BY id;

-- name: CreateUser :exec
INSERT INTO users
(id, username, email, password, role, is_delete, email_verified, create_time)
VALUES (gen_random_uuid(), $1, $2, $3, 'user', false, false,now());

-- name: UpdateUser :one
UPDATE users
SET 
username = $2,
email = $3,
avatar = $4,
password = $5,
update_time = now()
WHERE id = $1 AND is_delete = false
RETURNING *;

-- name: DeleteUser :exec
UPDATE users
SET is_delete = true,
update_time = now()
WHERE id = $1;


-- name: GetUserByUsernameAndPassword :one
SELECT * FROM users
WHERE username = $1 AND password = $2 AND is_delete = false LIMIT 1;

-- name: VeifyUser :exec
UPDATE users
SET email_verified = true, update_time = now()
WHERE Id = $1 AND is_delete = false;

-- name: UserExistsByUsernameOrEmail :one
SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE (username = $1 OR email = $2)
      AND is_delete = false
);
