package handlers

import (
	"encoding/json"
	"enqueue/internal/services"
	"net/http"

	"github.com/google/uuid"
)

type RepostHandler struct {
	repostService *services.RepostService
}

func NewRepostHandler(repostService *services.RepostService) *RepostHandler {
	return &RepostHandler{repostService: repostService}
}

func (h *RepostHandler) Repost(w http.ResponseWriter, r *http.Request) {
	postID, err := uuid.Parse(r.PathValue("postId"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}
	userID, ok := r.Context().Value("id").(uuid.UUID)

	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	err = h.repostService.Repost(r.Context(), userID, postID)
	if err != nil {
		http.Error(w, "failed to repost", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"reposted": true})
}

func (h *RepostHandler) UnRepost(w http.ResponseWriter, r *http.Request) {
	postID, err := uuid.Parse(r.PathValue("postId"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	err = h.repostService.UnRepost(r.Context(), userID, postID)
	if err != nil {
		http.Error(w, "failed to unrepost", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"unreposted": true})
}
