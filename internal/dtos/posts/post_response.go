package posts

import "enqueue/internal/database"

type PostResponse struct {
	Post     database.Post                   `json:"post"`
	Comments []database.GetCommentsByPostRow `json:"comments"`
}
