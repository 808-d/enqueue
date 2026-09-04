package middlewares

import (
	"enqueue/internal/utils"
	"log"
	"net/http"
)

func AuthorizeMiddleware(next http.Handler, role utils.Role) http.Handler {
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

		if claims.Role != role.String() {
			log.Printf("User don't have access right!! Required: %s, Got: %s", role, claims.Role)
			http.Error(w, "unauthorized", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
