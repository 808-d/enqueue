package middlewares

import (
	"context"
	"net/http"

	"enqueue/internal/utils"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		tokenString := cookie.Value

		// Validate/decode JWT here
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(
			r.Context(),
			"id",
			claims.UserID,
		)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
