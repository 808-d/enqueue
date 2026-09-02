package posts

import "github.com/google/uuid"

type UpdatePostRequest struct {
	ID      uuid.UUID `json:"id"`
	Title   string    `json:"title"`
	Content string    `json:"content"`
	Description string `json:"description"`
	ThumbnailUrl string `json:"thumbnailUrl"`
}
