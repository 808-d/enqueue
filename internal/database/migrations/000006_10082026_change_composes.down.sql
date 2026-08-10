ALTER TABLE composes
    DROP CONSTRAINT composes_role_check,
    DROP COLUMN create_time,
    DROP COLUMN role;