-- migrate:up

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_reply_to_fkey;

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_pkey;

ALTER TABLE comments
ADD CONSTRAINT comments_pkey
PRIMARY KEY (id);

ALTER TABLE comments
ADD CONSTRAINT comments_reply_to_fkey
FOREIGN KEY (reply_to)
REFERENCES comments(id);