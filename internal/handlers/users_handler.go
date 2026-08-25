package handlers

import (
	"encoding/json"
	"enqueue/internal/dtos/users"
	"enqueue/internal/services"
	"enqueue/internal/utils"
	"net/http"

	"github.com/google/uuid"
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

func (h *UsersHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	var req uuid.UUID

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.userService.GetUser(
		r.Context(),
		req,
	)
	if err != nil {
		http.Error(w, "failed to fetch user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *UsersHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromAuth(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req users.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	token, userResp, emailChangePending, err := h.userService.UpdateUser(
		r.Context(),
		userID,
		req.Username,
		req.Name,
		req.Avatar,
		req.Bio,
		req.Email,
	)
	if err != nil {
		http.Error(w, "failed to update user", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		MaxAge:   60 * 60 * 24 * 7,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"user":                 userResp,
		"email_change_pending": emailChangePending,
	})
}
func (h *UsersHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	var req uuid.UUID

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	err := h.userService.DeleteUser(
		r.Context(),
		req,
	)
	if err != nil {
		http.Error(w, "failed to delete user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
func (h *UsersHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req *users.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	err := h.userService.ChangePassword(r.Context(), userID, req.Passowrd, req.NewPassowrd)
	if err != nil {
		http.Error(w, "failed to update password", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
}
func (h *UsersHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromAuth(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userResp, err := h.userService.GetCurrentUser(r.Context(), userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(userResp)
}
func (h *UsersHandler) GetUserById(w http.ResponseWriter, r *http.Request) {
	userID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	user, err := h.userService.GetUserByID(r.Context(), userID)
	if err != nil {
		http.Error(w, "not found user", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)

}
