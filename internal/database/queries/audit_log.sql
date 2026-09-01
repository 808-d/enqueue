-- name: AddAuditLog :exec
INSERT INTO public.audit_logs
("action", entity_name, old_value, new_value, create_by)
VALUES($1, $2, $3, $4, $5);
