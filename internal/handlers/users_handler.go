package handlers

import (
	"encoding/json"
	"enqueue/internal/services"
	"net/http"
)

type UsersHandler struct {
	userService *services.UserService
}

func NewUsersHandler(userService *services.UserService) *UsersHandler {
	return &UsersHandler{userService: userService}
}

func (h *UsersHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.userService.GetUsers(r.Context())
	if err != nil {
		http.Error(w, "failed to fetch users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}
