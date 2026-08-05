package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"enqueue/internal/database"
	"enqueue/internal/handlers"
	"enqueue/internal/services"
)

func main() {

	if err := godotenv.Load(); err != nil {
		fmt.Fprint(os.Stderr, ".env not found", err)
	}
	// connect to db
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		os.Exit(1)
	}
	defer pool.Close()

	queries := database.New(pool)
	userService := services.NewUserService(queries)
	usersHandler := handlers.NewUsersHandler(userService)

	postService := services.NewPostService(queries)
	postsHandler := handlers.NewPostsHandler(postService)

	authService := services.NewAuthService(queries)
	authHandler := handlers.NewAuthHandler(authService)

	mux := http.NewServeMux()
	handlers.RegisterUserRoutes(mux, usersHandler)
	handlers.RegisterPostRoutes(mux, postsHandler)
	handlers.RegisterAuthRoutes(mux, authHandler)

	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
