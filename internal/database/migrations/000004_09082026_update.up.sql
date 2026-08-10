ALTER TABLE posts
    DROP COLUMN is_delete,
    ADD COLUMN thumbnail TEXT,
    ADD COLUMN description TEXT,
    ADD COLUMN status INT NOT NULL DEFAULT 1;

ALTER TABLE posts
    ADD CONSTRAINT posts_status_check
    CHECK (status IN (0, 1, 2, 3));

ALTER TABLE users
    ADD COLUMN bio TEXT,
    ADD COLUMN name TEXT;

ALTER TABLE comments
    ADD COLUMN reply_to UUID REFERENCES comments(id);