-- migrate:down

ALTER TABLE comments
ALTER COLUMN reply_to SET NOT NULL;