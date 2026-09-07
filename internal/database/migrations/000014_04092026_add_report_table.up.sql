CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id),
  reported_user_id uuid REFERENCES users(id),
  reason varchar(30) NOT NULL,
  details text,
  -- 0: pending, 1: resolved, 2: dismissed
  status int NOT NULL DEFAULT 0,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  create_time timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status);



CREATE TABLE direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "from" uuid NOT NULL REFERENCES users(id),
  "to" uuid NOT NULL REFERENCES users(id),
  message text
) INHERITS (soft_delete, time_log);


CREATE INDEX idx_direct_messages_from_to ON direct_messages("from", "to");
