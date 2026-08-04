// internal/handler/router.go
package handlers

import "net/http"

func RegisterUserRoutes(mux *http.ServeMux, h *UsersHandler) {
	mux.HandleFunc("GET /users", h.GetUsers)
}

func RegisterAuthRoutes(mux *http.ServeMux, h *AuthHandler) {
	mux.HandleFunc("POST /login", h.Login)
}
