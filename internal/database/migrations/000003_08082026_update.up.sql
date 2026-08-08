ALTER TABLE email_verifications
ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE TABLE IF NOT EXISTS composes (
  user_id uuid NOT NULL REFERENCES users(id),
  post_id uuid NOT NULL REFERENCES posts(id),
  create_time timestamp NOT NULL DEFAULT now(),
  update_time timestamp,
  PRIMARY KEY (user_id, post_id)
);