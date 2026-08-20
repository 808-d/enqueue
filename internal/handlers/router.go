// internal/handler/router.go
package handlers

import (
	"enqueue/internal/middlewares"
	"net/http"
)

func RegisterUserRoutes(mux *http.ServeMux, h *UsersHandler) {
	mux.HandleFunc("GET /users", h.GetUsers)
	mux.HandleFunc("PATCH /users", h.UpdateUser)
	mux.HandleFunc("DELETE /users", h.DeleteUser)
	mux.HandleFunc("GET /me", h.Me)
	mux.Handle("PATCH /password", middlewares.AuthMiddleware(http.HandlerFunc(h.ChangePassword)))
}
func RegisterPostRoutes(mux *http.ServeMux, h *PostsHandler) {
	mux.HandleFunc("GET /posts", h.GetPosts)
	mux.HandleFunc("GET /posts/p/{id}", h.GetPostsByUser)
	mux.HandleFunc("GET /posts/{id}", h.GetPostById)
	mux.Handle("POST /posts", middlewares.AuthMiddleware(http.HandlerFunc(h.CreatePost)))
	mux.Handle("PATCH /posts", middlewares.AuthMiddleware(http.HandlerFunc(h.UpdatePost)))
	mux.Handle("PATCH /posts/{id}", middlewares.AuthMiddleware(http.HandlerFunc(h.DeletePost)))
}

func RegisterAuthRoutes(mux *http.ServeMux, h *AuthHandler) {
	mux.HandleFunc("POST /login", h.Login)
	mux.HandleFunc("POST /signup", h.SignUp)
	mux.HandleFunc("POST /verify", h.Verify)
	mux.HandleFunc("GET /verify-email-change", h.VerifyEmailChange)
	mux.HandleFunc("POST /forgot-password", h.ForgotPassword)
	mux.HandleFunc("POST /reset-password", h.ResetPassword)
}
func RegisterCommentsRoutes(mux *http.ServeMux, h *CommentsHandler) {
	// mux.HandleFunc("GET /comments", h.Login)
	mux.Handle("POST /comments", middlewares.AuthMiddleware(http.HandlerFunc(h.CreateComment)))
	mux.HandleFunc("PATCH /comments", h.UpdateComment)
	mux.HandleFunc("PATCH /comments/{id}", h.DeleteComment)
}
