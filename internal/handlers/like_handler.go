package handlers

import (
	"encoding/json"
	"enqueue/internal/services"
	"net/http"

	"github.com/google/uuid"
)

type LikeHandler struct {
	likeService *services.LikeService
}

func NewLikeHandler(likeService *services.LikeService) *LikeHandler {
	return &LikeHandler{likeService: likeService}
}

func (h *LikeHandler) LikePost(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	postID, err := uuid.Parse(r.PathValue("postId"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	like, err := h.likeService.LikePost(r.Context(), userID, postID)
	if err != nil {
		http.Error(w, "failed to like post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"liked":      true,
		"likeCount":  like.UserID, // placeholder, will get actual count
	})
}

func (h *LikeHandler) UnlikePost(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	postID, err := uuid.Parse(r.PathValue("postId"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	err = h.likeService.UnlikePost(r.Context(), userID, postID)
	if err != nil {
		http.Error(w, "failed to unlike post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"liked": false,
	})
}

func (h *LikeHandler) GetLikeStatus(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	postID, err := uuid.Parse(r.PathValue("postId"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	hasLiked, _ := h.likeService.HasUserLiked(r.Context(), userID, postID)
	count, _ := h.likeService.GetLikeCount(r.Context(), postID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"liked":      hasLiked,
		"likeCount":  count,
	})
}