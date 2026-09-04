package posts

import "enqueue/internal/database"

type PostResponse struct {
	Post     PostDTO                     `json:"post"`
	Comments []database.GetCommentsByPostRow `json:"comments"`
}

type PostDTO struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Content     string `json:"content"`
	Thumbnail   string `json:"thumbnail"`
	Description string `json:"description"`
	CreateTime  string `json:"createTime"`
	UpdateTime  string `json:"updateTime"`
	Status      int32  `json:"status"`
}

func NewPostDTO(post database.Post) PostDTO {
	return PostDTO{
		ID:          post.ID.String(),
		Title:       post.Title.String,
		Content:     post.Content.String,
		Thumbnail:   post.Thumbnail.String,
		Description: post.Description.String,
		CreateTime:  post.CreateTime.Time.Format("2006-01-02T15:04:05Z"),
		UpdateTime:  post.UpdateTime.Time.Format("2006-01-02T15:04:05Z"),
		Status:      post.Status,
	}
}
