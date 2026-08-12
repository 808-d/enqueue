-- migrate:up

ALTER TABLE comments
ALTER COLUMN reply_to DROP NOT NULL;