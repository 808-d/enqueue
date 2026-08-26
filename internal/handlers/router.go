// internal/handler/router.go
package handlers

import (
	"enqueue/internal/middlewares"
	"enqueue/internal/ws"
	"net/http"
)

func RegisterUserRoutes(mux *http.ServeMux, h *UsersHandler) {
	mux.HandleFunc("GET /users", h.GetUsers)
	mux.Handle("PATCH /users", middlewares.AuthMiddleware(http.HandlerFunc(h.UpdateUser)))
	mux.Handle("DELETE /users", middlewares.AuthMiddleware(http.HandlerFunc(h.DeleteUser)))
	mux.Handle("GET /users/{id}", middlewares.AuthMiddleware(http.HandlerFunc(h.GetUserById)))
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
	mux.HandleFunc("POST /logout", h.Logout)
}
func RegisterCommentsRoutes(mux *http.ServeMux, h *CommentsHandler) {
	// mux.HandleFunc("GET /comments", h.Login)
	mux.Handle("POST /comments", middlewares.AuthMiddleware(http.HandlerFunc(h.CreateComment)))
	mux.HandleFunc("PATCH /comments", h.UpdateComment)
	mux.HandleFunc("PATCH /comments/{id}", h.DeleteComment)
}

func RegisterFollowRoutes(mux *http.ServeMux, h *FollowsHandler) {
	mux.Handle("POST /follows", middlewares.AuthMiddleware(http.HandlerFunc(h.FollowUser)))
	mux.Handle("DELETE /follows", middlewares.AuthMiddleware(http.HandlerFunc(h.UnfollowUser)))
	mux.HandleFunc("GET /follows/followers/{id}", h.GetFollowers)
	mux.HandleFunc("GET /follows/following/{id}", h.GetFollowing)
	mux.Handle("POST /follows/is-following", middlewares.AuthMiddleware(http.HandlerFunc(h.IsFollowing)))
	mux.HandleFunc("GET /follows/count/followers/{id}", h.CountFollowers)
	mux.HandleFunc("GET /follows/count/following/{id}", h.CountFollowing)
}

func RegisterNotificationRoutes(mux *http.ServeMux, h *NotisHandler) {
	mux.Handle("GET /notifications", middlewares.AuthMiddleware(http.HandlerFunc(h.GetNotifications)))
	mux.Handle("GET /notifications/unread-count", middlewares.AuthMiddleware(http.HandlerFunc(h.GetUnreadCount)))
	mux.Handle("PATCH /notifications/{id}/read", middlewares.AuthMiddleware(http.HandlerFunc(h.MarkAsRead)))
	mux.Handle("PATCH /notifications/read-all", middlewares.AuthMiddleware(http.HandlerFunc(h.MarkAllAsRead)))
}

func WsRoutes(mux *http.ServeMux, s *ws.NotificationHub) {
	mux.HandleFunc("GET /ws/subscribe", s.SubscribeHandler)
}
