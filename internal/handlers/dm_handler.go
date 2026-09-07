package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"enqueue/internal/services"

	"github.com/google/uuid"
)

type DMHandler struct {
	dmService *services.DMService
}

func NewDMHandler(dmService *services.DMService) *DMHandler {
	return &DMHandler{dmService: dmService}
}

func (h *DMHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"messages": []any{}})
}

func (h *DMHandler) GetConversation(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("id").(uuid.UUID)
	otherID, err := uuid.Parse(r.PathValue("userId"))
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	msgs, err := h.dmService.GetConversationMessages(r.Context(), userID, otherID, 100)
	if err != nil {
		http.Error(w, "failed to get messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"messages": msgs})
}

func (h *DMHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	senderID := r.Context().Value("id").(uuid.UUID)

	var req struct {
		ToID    uuid.UUID `json:"toId"`
		Content string    `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Content == "" {
		http.Error(w, "content is required", http.StatusBadRequest)
		return
	}

	msg, err := h.dmService.AddMessage(r.Context(), senderID, req.ToID, req.Content)
	if err != nil {
		log.Printf("error: %s", err)
		http.Error(w, "failed to send message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}

func (h *DMHandler) UpdateMessage(w http.ResponseWriter, r *http.Request) {
	msgID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid message id", http.StatusBadRequest)
		return
	}

	var req struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	msg, err := h.dmService.UpdateMessage(r.Context(), msgID, req.Content)
	if err != nil {
		http.Error(w, "failed to update message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}

func (h *DMHandler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	msgID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid message id", http.StatusBadRequest)
		return
	}

	msg, err := h.dmService.DeleteMessage(r.Context(), msgID)
	if err != nil {
		http.Error(w, "failed to delete message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}
