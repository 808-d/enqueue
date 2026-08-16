package comments

import "github.com/google/uuid"

type UpdateCommentRequest struct {
	PostId  uuid.UUID `json:"postId"`
	Content string    `json:"content"`
}
