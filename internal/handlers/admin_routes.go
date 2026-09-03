package handlers

import (
	"enqueue/internal/middlewares"
	"enqueue/internal/utils"
	"net/http"
)

func RegisterAdminRoutes(mux *http.ServeMux, h *AdminHandler) {
	// Public routes
	mux.HandleFunc("POST /admin/login", h.AdminLogin)
	mux.HandleFunc("POST /admin/logout", h.Logout)
	mux.HandleFunc("POST /admin/forgot-password", h.AdminForgotPassword)
	mux.HandleFunc("POST /admin/reset-password", h.AdminResetPassword)

	// Protected admin routes
	mux.Handle("GET /admin/statistics", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.GetStatistics), utils.RoleAdmin)))
	mux.Handle("GET /admin/users", middlewares.AuthMiddleware(middlewares.AuthorizeMiddleware(http.HandlerFunc(h.ListUsers), utils.RoleAdmin)))
}
