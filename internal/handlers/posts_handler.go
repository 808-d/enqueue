package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"enqueue/internal/dtos/posts"
	"enqueue/internal/services"
	"enqueue/internal/utils"

	"github.com/google/uuid"
)

type PostsHandler struct {
	postService *services.PostService
}

func NewPostsHandler(postService *services.PostService) *PostsHandler {
	return &PostsHandler{postService: postService}
}

func (h *PostsHandler) GetPosts(w http.ResponseWriter, r *http.Request) {
	var cursorTime *time.Time
	var cursorID *uuid.UUID

	if timeStr := r.URL.Query().Get("cursor_time"); timeStr != "" {
		if unixSec, err := strconv.ParseInt(timeStr, 10, 64); err == nil {
			t := time.Unix(unixSec, 0)
			cursorTime = &t
		}
	}
	if idStr := r.URL.Query().Get("cursor_id"); idStr != "" {
		if id, err := uuid.Parse(idStr); err == nil {
			cursorID = &id
		}
	}

	limit := int32(20)
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.ParseInt(limitStr, 10, 32); err == nil && l > 0 && l <= 100 {
			limit = int32(l)
		}
	}

	// Extract user ID from JWT cookie if present (optional auth)
	var userID *uuid.UUID
	if cookie, err := r.Cookie("token"); err == nil {
		if claims, err := utils.ValidateToken(cookie.Value); err == nil {
			userID = &claims.UserID
		}
	}

	posts, err := h.postService.GetPosts(r.Context(), cursorTime, cursorID, limit, userID)

	if err != nil {
		http.Error(w, "failed to get posts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func (h *PostsHandler) GetPostsByUser(w http.ResponseWriter, r *http.Request) {
	targetUserID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}

	// Extract current user ID from JWT cookie if present (optional auth)
	var currentUserID *uuid.UUID
	if cookie, err := r.Cookie("token"); err == nil {
		if claims, err := utils.ValidateToken(cookie.Value); err == nil {
			currentUserID = &claims.UserID
		}
	}

	posts, err := h.postService.GetPostsByUser(r.Context(), targetUserID, currentUserID)
	if err != nil {
		http.Error(w, "failed to get posts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}

func (h *PostsHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	userId := r.Context().Value("id").(uuid.UUID)

	post, err := h.postService.CreatePost(r.Context(), userId)
	if err != nil {
		http.Error(w, "failed to create post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *PostsHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	var req posts.UpdatePostRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	updatedPost, err := h.postService.UpdatePost(r.Context(), req.ID, req.Title, req.Content, req.Description, req.ThumbnailUrl)
	if err != nil {
		http.Error(w, "failed to update post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedPost)
}

func (h *PostsHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	postId, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	post, err := h.postService.DeletePost(r.Context(), postId)
	if err != nil {
		http.Error(w, "failed to delete post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (h *PostsHandler) GetPostById(w http.ResponseWriter, r *http.Request) {
	postId, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	post, comments, err := h.postService.GetPostById(r.Context(), postId)
	if err != nil {
		log.Printf("failed to get post %s: %v", postId, err)
		http.Error(w, "failed to get post", http.StatusInternalServerError)
		return
	}

	response := posts.PostResponse{
		Post:     posts.NewPostDTO(post),
		Comments: comments,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		return
	}
}

func (h *PostsHandler) UpdatePostStatus(w http.ResponseWriter, r *http.Request) {
	postId, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid post id", http.StatusBadRequest)
		return
	}

	post, err := h.postService.UpdatePostStatus(r.Context(), postId)
	if err != nil {
		http.Error(w, "failed to update post status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}
