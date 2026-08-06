package handlers

import (
	"encoding/json"
	"enqueue/internal/services"
	"enqueue/internal/utils"
	"log"
	"net/http"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Decode error: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Printf("request: %+v\n", req)

	hashedPassword := utils.Hash256(req.Password)
	token, err := h.authService.GetUserByUsernameAndPassword(
		r.Context(),
		req.Username,
		hashedPassword,
	)
	if err != nil {
		log.Printf("Service error: %v\n", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if token == "" {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	// save in http cookie only
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // true in production with HTTPS
		SameSite: http.SameSiteLaxMode,
		MaxAge:   60 * 60 * 24 * 7, // 7 days
	})

	w.WriteHeader(http.StatusOK)
}
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {

}
