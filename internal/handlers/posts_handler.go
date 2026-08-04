package handlers

import (
	"enqueue/internal/services"
	"net/http"
)

type PostsHandler struct {
	postService *services.PostService
}

func (h *PostsHandler) GetPosts(w http.ResponseWriter, r *http.Request) {

}
