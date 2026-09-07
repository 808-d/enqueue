-- name: GetReports :many
SELECT
    rp.id,
    reporter.username AS reporter_username,
    reported.username AS reported_username,
    resolver.username AS resolved_by_username,
    rp.reason,
    rp.details,
    rp.status
FROM reports rp
INNER JOIN users reporter
    ON rp.reporter_id = reporter.id
LEFT JOIN users reported
    ON rp.reported_user_id = reported.id
LEFT JOIN users resolver
    ON rp.resolved_by = resolver.id
ORDER BY rp.create_time DESC
LIMIT $1 OFFSET $2;

-- name: CountReports :one
SELECT COUNT(*) FROM reports;

-- name: AddReport :one
INSERT INTO reports
(reporter_id, reported_user_id, reason, details, status)
VALUES ($1, $2, $3, $4, 0)
RETURNING *;

-- name: UpdateReport :one
WITH updated AS (
    UPDATE reports
    SET status = $2, resolved_by = $3, resolved_at = now()
    WHERE reports.id = $1
    RETURNING *
)
SELECT
    updated.id,
    reporter.username AS reporter_username,
    reported.username AS reported_username,
    resolver.username AS resolved_by_username,
    updated.reason,
    updated.details,
    updated.status
FROM updated
INNER JOIN users reporter
    ON updated.reporter_id = reporter.id
LEFT JOIN users reported
    ON updated.reported_user_id = reported.id
LEFT JOIN users resolver
    ON updated.resolved_by = resolver.id;
