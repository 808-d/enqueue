package handlers

import (
	"encoding/json"
	"enqueue/internal/dtos/auth"
	"enqueue/internal/dtos/users"
	"enqueue/internal/services"
	"enqueue/internal/utils"
	"errors"
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

func (h *AuthHandler) VerifyEmailChange(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		http.Error(w, "missing token", http.StatusBadRequest)
		return
	}

	newToken, err := h.authService.VerifyEmailChange(r.Context(), token)
	if err != nil {
		if errors.Is(err, utils.ErrInvalidOrExpiredToken) {
			http.Error(w, "invalid or expired verification link", http.StatusBadRequest)
			return
		}
		http.Error(w, "failed to confirm email change", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    newToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // true in production
		SameSite: http.SameSiteLaxMode,
		MaxAge:   60 * 60 * 24 * 7,
	})

	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req auth.ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Username == "" {
		http.Error(w, "username is required", http.StatusBadRequest)
		return
	}

	// intentionally ignore the error here — always respond the same way
	_ = h.authService.RequestPasswordReset(r.Context(), req.Username)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "If an account with that username exists, a password reset link has been sent.",
	})
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req users.ResetPasswordRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Token == "" {
		http.Error(w, "missing token", http.StatusBadRequest)
		return
	}

	if req.NewPassword == "" {
		http.Error(w, "password is required", http.StatusBadRequest)
		return
	}

	if err := h.authService.ResetPassword(
		r.Context(),
		req.Token,
		req.NewPassword,
	); err != nil {
		if errors.Is(err, utils.ErrInvalidResetToken) {
			http.Error(
				w,
				"invalid or expired reset token",
				http.StatusBadRequest,
			)
			return
		}

		log.Printf("failed to reset password: %v", err)

		http.Error(
			w,
			"failed to reset password",
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
