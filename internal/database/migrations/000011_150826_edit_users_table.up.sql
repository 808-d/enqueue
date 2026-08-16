ALTER TABLE users
ADD COLUMN pending_email varchar(50) UNIQUE;

CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES users(id),
  following_id uuid NOT NULL REFERENCES users(id),
  create_time timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);