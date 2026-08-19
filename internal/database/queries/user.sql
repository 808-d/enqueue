-- name: GetUser :one
SELECT * FROM users WHERE id = $1 AND is_delete = false LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users WHERE is_delete = false and role = 'user' ORDER BY id;

-- name: CreateUser :one
INSERT INTO users
(id, username, email, password,name, role, is_delete, email_verified, create_time)
VALUES (gen_random_uuid(), $1, $2, $3, $4,'user', false, false,now())
RETURNING id;


-- name: UpdateUserNotIncludeEmail :one
UPDATE users
SET 
username = $2,
name = $3,
avatar = $4,
bio = $5,
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

-- name: VerifyUser :exec
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


-- name: CheckVerify :one
SELECT user_id FROM email_verifications
WHERE (token = $1 AND expires_at < now());

-- name: DeleteToken :exec
DELETE FROM email_verifications
WHERE "token"= $1;


-- name: GetUserIdByUsername :one
SELECT id FROM users
WHERE username = $1 AND is_delete = false LIMIT 1;

-- name: AddPendingEmail :exec
UPDATE users
SET pending_email = $2,
    update_time = now()
WHERE id = $1 AND is_delete = false;

-- name: ConfirmEmailChange :one
UPDATE users SET email = pending_email,
pending_email = null,
update_time = now()
where id = $1 and is_delete = false
RETURNING *;


-- name: UpdatePassword :exec
UPDATE users SET password = $2,
update_time = now()
where id = $1 and is_delete = false;


-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = $1 AND is_delete = false LIMIT 1;