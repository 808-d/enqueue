package handlers

import (
	"encoding/json"
	"enqueue/internal/dtos/posts"
	"enqueue/internal/services"
	"log"
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
func (h *PostsHandler) GetPostsByUser(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	post, err := h.postService.GetPostsByUser(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to create post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *PostsHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	post, err := h.postService.CreatePost(r.Context(), userId)
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
	postId, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	post, err := h.postService.DeletePost(r.Context(), postId)
	if err != nil {
		log.Printf("failed to delete post %s: %v", postId, err)
		http.Error(w, "failed to delete post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(post); err != nil {
		return
	}
}

func (h *PostsHandler) GetPostById(w http.ResponseWriter, r *http.Request) {
	postId, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	post, comments, err := h.postService.GetPostById(r.Context(), postId)
	if err != nil {
		log.Printf("failed to get post %s: %v", postId, err)
		http.Error(w, "failed to get post", http.StatusInternalServerError)
		return
	}

	response := posts.PostResponse{
		Post:     post,
		Comments: comments,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}

func (h *PostsHandler) UpdatePostStatus(w http.ResponseWriter, r *http.Request) {
	postId, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	post, err := h.postService.UpdatePostStatus(r.Context(), postId)
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
