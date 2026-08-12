package comments

import "github.com/google/uuid"

type CreateCommentRequest struct {
	PostId  uuid.UUID `json:"postId"`
	Content string    `json:"content"`
	ReplyTo uuid.UUID `json:"replyTo"`
}
