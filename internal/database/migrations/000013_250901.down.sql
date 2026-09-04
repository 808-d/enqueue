ALTER TABLE audit_logs
ALTER COLUMN old_value TYPE text USING old_value::text,
ALTER COLUMN new_value TYPE text USING new_value::text;
