package handlers

import (
	"encoding/json"
	"enqueue/internal/services"
	"net/http"

	"github.com/google/uuid"
)

type NotisHandler struct {
	notiService *services.NotisService
}

func NewNotisHandler(notiService *services.NotisService) *NotisHandler {
	return &NotisHandler{notiService: notiService}
}

func (h *NotisHandler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	notifications, err := h.notiService.GetNotifications(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get notifications", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

func (h *NotisHandler) GetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	count, err := h.notiService.GetUnreadCount(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to get unread count", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"count": count})
}

func (h *NotisHandler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	notificationIDStr := r.PathValue("id")
	notificationID, err := uuid.Parse(notificationIDStr)
	if err != nil {
		http.Error(w, "invalid notification id", http.StatusBadRequest)
		return
	}

	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	err = h.notiService.MarkAsRead(r.Context(), userID, notificationID)
	if err != nil {
		http.Error(w, "failed to mark as read", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "marked as read"})
}

func (h *NotisHandler) MarkAllAsRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	err := h.notiService.MarkAllAsRead(r.Context(), userID)
	if err != nil {
		http.Error(w, "failed to mark all as read", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "all marked as read"})
}
