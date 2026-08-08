
-- name: CreateEmailVerification :exec
INSERT INTO email_verifications
(user_id, "token", expires_at)
VALUES($1, $2, $3);