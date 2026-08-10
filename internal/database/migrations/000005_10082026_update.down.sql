ALTER TABLE posts
ALTER COLUMN title TYPE VARCHAR(100),
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN title SET DEFAULT 'No Title';




ALTER TABLE composes
    NO INHERIT time_log;

ALTER TABLE composes
    ADD COLUMN create_time timestamp NOT NULL DEFAULT now(),
    ADD COLUMN update_time timestamp;