package handlers

import (
	"encoding/json"
	"enqueue/internal/dtos/auth"
	"enqueue/internal/dtos/users"
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

	err := h.authService.Signup(r.Context(), req.Username, req.Email, req.Password)

	if err != nil {
		log.Printf("Decode error: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *AuthHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var req users.VerifyRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	isValid, err := h.authService.Verify(r.Context(), req.Token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if !isValid {
		http.Error(
			w,
			"Invalid or expired verification token",
			http.StatusBadRequest,
		)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil {
		log.Printf("Error: %v\n", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	claims, err := h.authService.DecodeToken(cookie.Value)
	if err != nil {
		log.Printf("Error: %v\n", err)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(claims)
}
