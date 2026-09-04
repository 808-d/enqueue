DROP TABLE notifications;

CREATE TABLE email_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    email varchar(255) NOT NULL,
    token varchar(255) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    create_time timestamptz NOT NULL DEFAULT now()
);