// internal/handler/router.go
package handlers

import (
	"enqueue/internal/middlewares"
	"net/http"
)

func RegisterUserRoutes(mux *http.ServeMux, h *UsersHandler) {
	mux.HandleFunc("GET /users", h.GetUsers)
	mux.HandleFunc("PUT /users", h.UpdateUser)
	mux.HandleFunc("DELETE /users", h.DeleteUser)
}
func RegisterPostRoutes(mux *http.ServeMux, h *PostsHandler) {
	mux.HandleFunc("GET /posts", h.GetPosts)
	mux.Handle("POST /posts", middlewares.AuthMiddleware(http.HandlerFunc(h.CreatePost)))
	mux.Handle("PUT /posts", middlewares.AuthMiddleware(http.HandlerFunc(h.UpdatePost)))
	mux.Handle("DELETE /posts", middlewares.AuthMiddleware(http.HandlerFunc(h.DeletePost)))
}

func RegisterAuthRoutes(mux *http.ServeMux, h *AuthHandler) {
	mux.HandleFunc("POST /login", h.Login)
	mux.HandleFunc("POST /signup", h.SignUp)
	mux.HandleFunc("POST /verify", h.Verify)
	mux.HandleFunc("GET /me", h.Me)
}
