package handlers

import (
	"encoding/json"
	"enqueue/internal/dtos/auth"
	"enqueue/internal/services"
	"log"
	"net/http"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req auth.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Decode error: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log.Printf("request: %+v\n", req)

	token, err := h.authService.GetToken(
		r.Context(),
		req.Username,
		req.Password,
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
func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {

	var req auth.SigninRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Decode error: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	isValid, err := h.authService.ValidateSignUpRequest(r.Context(), req.Username, req.Email)
	if err != nil {
		log.Printf("Validation error: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if !isValid {
		http.Error(w, "Invalid sign up request", http.StatusBadRequest)
		return
	}

	err = h.authService.CreateUser(r.Context(), req.Username, req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
}
