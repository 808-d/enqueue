package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"github.com/rs/cors"

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

	// connect to redis
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password
		DB:       0,  // use default DB
		Protocol: 2,
	})
	defer rdb.Close()
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatalf("unable to connect to redis: %v", err)
	}

	userService := services.NewUserService(pool, rdb)
	usersHandler := handlers.NewUsersHandler(userService)

	postService := services.NewPostService(pool)
	postsHandler := handlers.NewPostsHandler(postService)

	authService := services.NewAuthService(pool, rdb)
	authHandler := handlers.NewAuthHandler(authService)

	commentService := services.NewCommentService(queries)
	commentHandler := handlers.NewCommentssHandler(commentService)

	mux := http.NewServeMux()
	handlers.RegisterUserRoutes(mux, usersHandler)
	handlers.RegisterPostRoutes(mux, postsHandler)
	handlers.RegisterAuthRoutes(mux, authHandler)
	handlers.RegisterCommentsRoutes(mux, commentHandler)

	// middlewares
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONTEND_URL"), os.Getenv("BACKEND_URL")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", c.Handler(mux)))

}
