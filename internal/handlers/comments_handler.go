package handlers

import (
	"encoding/json"
	"enqueue/internal/dtos/comments"
	"enqueue/internal/services"
	"log"
	"net/http"

	"github.com/google/uuid"
)

type CommentsHandler struct {
	commentService *services.CommentService
}

func NewCommentssHandler(commentService *services.CommentService) *CommentsHandler {
	return &CommentsHandler{commentService: commentService}
}

func (h *CommentsHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var req comments.CreateCommentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	userId, ok := r.Context().Value("id").(uuid.UUID)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	comment, err := h.commentService.CreateComment(r.Context(), userId, req.PostId, req.Content, req.ReplyTo)
	if err != nil {
		http.Error(w, "failed to create post", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}

func (h *CommentsHandler) UpdateComment(w http.ResponseWriter, r *http.Request) {
	var req comments.UpdateCommentRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf(
			"failed to update comment: user_id=%s post_id=%s error=%v",
			req.PostId,
			req.Content,
			err,
		)
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	comment, err := h.commentService.UpdateComment(r.Context(), req.PostId, req.Content)
	if err != nil {
		http.Error(w, "failed to update comment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}

func (h *CommentsHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	commentId, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid comment id", http.StatusBadRequest)
		return
	}
	comment, err := h.commentService.DeleteComment(r.Context(), commentId)
	if err != nil {
		http.Error(w, "failed to delete comment", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comment)
}
