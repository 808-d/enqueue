package handlers

import (
	"encoding/json"
	"enqueue/internal/dtos/posts"
	"enqueue/internal/services"
	"net/http"

	"github.com/google/uuid"
)

type PostsHandler struct {
	postService *services.PostService
}

func NewPostsHandler(postService *services.PostService) *PostsHandler {
	return &PostsHandler{postService: postService}
}

func (h *PostsHandler) GetPosts(w http.ResponseWriter, r *http.Request) {

}

func (h *PostsHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	var req posts.CreatePostRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	post, err := h.postService.CreatePost(r.Context(), req.Title, req.Content)
	if err != nil {
		http.Error(w, "failed to create post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *PostsHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	var req posts.UpdatePostRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	updatedPost, err := h.postService.UpdatePost(r.Context(), req.ID, req.Title, req.Content)
	if err != nil {
		http.Error(w, "failed to update post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedPost)
}
func (h *PostsHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	var req uuid.UUID

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	post, err := h.postService.DeletePost(r.Context(), req)
	if err != nil {
		http.Error(w, "failed to delete post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(post); err != nil {
		return
	}
}
