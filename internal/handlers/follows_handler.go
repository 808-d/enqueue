package handlers

import (
	"encoding/json"
	"enqueue/internal/services"
	"net/http"

	"github.com/google/uuid"
)

type FollowsHandler struct {
	followsService *services.FollowsService
}

func NewFollowsHandler(followsService *services.FollowsService) *FollowsHandler {
	return &FollowsHandler{followsService: followsService}
}

func (h *FollowsHandler) FollowUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FollowingID uuid.UUID `json:"followingId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	followerID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	notif, err := h.followsService.FollowUser(r.Context(), followerID, req.FollowingID)
	if err != nil {
		http.Error(w, "failed to follow user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if notif.ID != "" {
		json.NewEncoder(w).Encode(notif)
	} else {
		json.NewEncoder(w).Encode(map[string]string{"message": "followed successfully"})
	}
}

func (h *FollowsHandler) UnfollowUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FollowingID uuid.UUID `json:"followingId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	followerID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	if err := h.followsService.UnfollowUser(r.Context(), followerID, req.FollowingID); err != nil {
		http.Error(w, "failed to unfollow user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "unfollowed successfully"})
}

func (h *FollowsHandler) GetFollowers(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	followers, err := h.followsService.GetFollowers(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get followers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(followers)
}

func (h *FollowsHandler) GetFollowing(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	following, err := h.followsService.GetFollowing(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get following", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(following)
}

func (h *FollowsHandler) IsFollowing(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FollowingID uuid.UUID `json:"followingId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	followerID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	isFollowing, err := h.followsService.IsFollowing(r.Context(), followerID, req.FollowingID)
	if err != nil {
		http.Error(w, "failed to check follow status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"isFollowing": isFollowing})
}

func (h *FollowsHandler) CountFollowers(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	count, err := h.followsService.CountFollowers(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to count followers", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"count": count})
}

func (h *FollowsHandler) CountFollowing(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.PathValue("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	count, err := h.followsService.CountFollowing(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to count following", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"count": count})
}