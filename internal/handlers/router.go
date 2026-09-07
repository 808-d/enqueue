// internal/handler/router.go
package handlers

import (
	"enqueue/internal/middlewares"
	"enqueue/internal/utils"
	"enqueue/internal/ws"
	"net/http"
)

func RegisterUserRoutes(mux *http.ServeMux, h *UsersHandler) {
	mux.HandleFunc("GET /users", h.GetUsers)
	mux.Handle("PATCH /users", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.UpdateUser), utils.RoleUser)))
	mux.Handle("DELETE /users", middlewares.AuthMiddleware(http.HandlerFunc(h.DeleteUser)))
	mux.Handle("GET /users/{id}", middlewares.AuthMiddleware(http.HandlerFunc(h.GetUserById)))
	mux.HandleFunc("GET /me", h.Me)
	mux.Handle("PATCH /password", middlewares.AuthMiddleware(http.HandlerFunc(h.ChangePassword)))
}

func RegisterLikeRoutes(mux *http.ServeMux, h *LikeHandler) {
	mux.Handle("POST /posts/like/{postId}", middlewares.AuthMiddleware(http.HandlerFunc(h.LikePost)))
	mux.Handle("DELETE /posts/like/{postId}", middlewares.AuthMiddleware(http.HandlerFunc(h.UnlikePost)))
	mux.Handle("GET /posts/like/{postId}", middlewares.AuthMiddleware(http.HandlerFunc(h.GetLikeStatus)))
}

func RegisterRepostRoutes(mux *http.ServeMux, h *RepostHandler) {
	mux.Handle("POST /posts/repost/{postId}", middlewares.AuthMiddleware(http.HandlerFunc(h.Repost)))
	mux.Handle("DELETE /posts/repost/{postId}", middlewares.AuthMiddleware(http.HandlerFunc(h.UnRepost)))
}

func RegisterPostRoutes(mux *http.ServeMux, h *PostsHandler) {
	mux.Handle("GET /posts", http.HandlerFunc(h.GetPosts))
	mux.HandleFunc("GET /posts/user/{id}", h.GetPostsByUser)
	mux.HandleFunc("GET /posts/user/{id}/liked", h.GetLikedPostsByUser)
	mux.HandleFunc("GET /posts/user/{id}/reposted", h.GetRepostedPostsByUser)
	mux.HandleFunc("GET /posts/{id}", h.GetPostById)
	mux.Handle("POST /posts", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.CreatePost), utils.RoleUser)))
	mux.Handle("PATCH /posts", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.UpdatePost), utils.RoleUser)))
	mux.Handle("PATCH /posts/{id}", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.DeletePost), utils.RoleUser)))
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
	mux.Handle("POST /comments", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.CreateComment), utils.RoleUser)))
	mux.Handle("PATCH /comments", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.UpdateComment), utils.RoleUser)))
	mux.Handle("PATCH /comments/{id}", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.DeleteComment), utils.RoleUser)))
	mux.HandleFunc("GET /comments/post/{postId}", h.GetCommentsByPost)
}

func RegisterFollowRoutes(mux *http.ServeMux, h *FollowsHandler) {
	mux.Handle("POST /follows", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.FollowUser), utils.RoleUser)))
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

func RegisterAdminRoutes(mux *http.ServeMux, h *AdminHandler) {
	// Public routes
	mux.HandleFunc("POST /admin/login", h.AdminLogin)
	mux.HandleFunc("POST /admin/logout", h.Logout)
	mux.HandleFunc("POST /admin/forgot-password", h.AdminForgotPassword)
	mux.HandleFunc("POST /admin/reset-password", h.AdminResetPassword)

	// Protected admin routes
	mux.Handle("GET /admin/statistics", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.GetStatistics), utils.RoleAdmin)))
	mux.Handle("GET /admin/users", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.ListUsers), utils.RoleAdmin)))
	mux.Handle("PATCH /admin/users/{id}/toggle", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.ToggleUserStatus), utils.RoleAdmin)))
}

func RegisterDMRoutes(mux *http.ServeMux, h *DMHandler) {
	mux.Handle("GET /dm/conversation/{userId}", middlewares.AuthMiddleware(http.HandlerFunc(h.GetConversation)))
	mux.Handle("POST /dm/send", middlewares.AuthMiddleware(http.HandlerFunc(h.SendMessage)))
	mux.Handle("PATCH /dm/{id}", middlewares.AuthMiddleware(http.HandlerFunc(h.UpdateMessage)))
	mux.Handle("DELETE /dm/{id}", middlewares.AuthMiddleware(http.HandlerFunc(h.DeleteMessage)))
}

func RegisterReportRoutes(mux *http.ServeMux, h *ReportHandler) {
	// Protected routes
	mux.Handle("POST /reports", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.CreateReport), utils.RoleUser)))
	mux.Handle("GET /admin/reports", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.GetReports), utils.RoleAdmin)))
	mux.Handle("PATCH /admin/reports/{id}", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.UpdateReportStatus), utils.RoleAdmin)))
}

func WsRoutes(mux *http.ServeMux, s *ws.NotificationHub, p *ws.PostHub, d *ws.DirectMessageHub) {
	mux.HandleFunc("GET /ws/subscribe", s.SubscribeHandler)
	mux.HandleFunc("GET /ws/post/{postId}", p.EnterHandler)
	mux.HandleFunc("GET /ws/dm/{userId2}", d.EnterHandler)
}
