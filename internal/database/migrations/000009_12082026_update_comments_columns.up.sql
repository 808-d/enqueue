DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    post_id UUID NOT NULL,

    content TEXT NOT NULL,

    reply_to UUID,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (reply_to) REFERENCES comments(id)
) INHERITS (soft_delete, time_log);