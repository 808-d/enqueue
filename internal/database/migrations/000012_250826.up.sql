DROP TABLE IF EXISTS email_verifications;

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id uuid NOT NULL REFERENCES users(id),
    actor_id uuid REFERENCES users(id),
    type varchar(30) NOT NULL,
    entity_id uuid,
    read_at timestamptz,
    create_time timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, create_time DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE read_at IS NULL; 