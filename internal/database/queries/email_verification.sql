
-- name: CreateEmailVerification :exec
INSERT INTO email_verifications
(user_id, "token", expires_at)
VALUES($1, $2, $3);

-- name: GetUserByToken :exec
SELECT * FROM email_verifications
WHERE token = $1 AND expires_at < now();