ALTER TABLE composes
    NO INHERIT time_log;

ALTER TABLE composes
    DROP COLUMN update_time;

ALTER TABLE composes
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'author';

ALTER TABLE composes
    ADD CONSTRAINT composes_role_check
    CHECK (role IN ('author', 'collaborator'));