package ws

import (
	"encoding/json"
	"enqueue/internal/utils"
	"net/http"
	"os"
	"sync"

	"github.com/coder/websocket"
	"github.com/google/uuid"
)

type PostHub struct {
	mu    sync.Mutex
	conns map[uuid.UUID]map[*user]struct{}
}

type user struct {
	id   uuid.UUID
	msgs chan []byte
}

func NewPostHub() *PostHub {
	return &PostHub{
		conns: make(map[uuid.UUID]map[*user]struct{}),
	}
}

func (h *PostHub) EnterHandler(w http.ResponseWriter, r *http.Request) {
	userId, err := utils.GetUserIDFromAuth(r)

	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	postId, err := uuid.Parse(r.PathValue("postId"))
	if err != nil {
		http.Error(w, "invalid postId", http.StatusBadRequest)
		return
	}

	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{os.Getenv("FRONTEND_URL")},
	})
	if err != nil {
		return
	}
	defer conn.CloseNow()

	u := h.enter(postId, userId)
	defer h.leave(postId, userId)

	// Handle sending messages to the websocket
	ctx := r.Context()
	for {
		select {
		case msg := <-u.msgs:
			if err := conn.Write(ctx, websocket.MessageText, msg); err != nil {
				return
			}
		case <-ctx.Done():
			return
		}
	}
}

func (h *PostHub) enter(postId uuid.UUID, userId uuid.UUID) *user {
	h.mu.Lock()
	defer h.mu.Unlock()

	u := &user{
		id:   userId,
		msgs: make(chan []byte, 16),
	}
	if h.conns[postId] == nil {
		h.conns[postId] = make(map[*user]struct{})
	}
	h.conns[postId][u] = struct{}{}
	return u
}

func (h *PostHub) leave(postID uuid.UUID, userID uuid.UUID) {
	h.mu.Lock()
	defer h.mu.Unlock()

	users := h.conns[postID]

	for u := range users {
		if u.id == userID {
			delete(users, u)
			break
		}
	}

	if len(users) == 0 {
		delete(h.conns, postID)
	}
}

func (h *PostHub) BroadcastToPost(postID uuid.UUID, payload any) {
	h.mu.Lock()
	defer h.mu.Unlock()

	users, ok := h.conns[postID]
	if !ok {
		return
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return
	}

	for u := range users {
		go func(u *user) {
			select {
			case u.msgs <- data:
			default:
			}
		}(u)
	}
}

func (h *PostHub) BroadcastCommentDeleted(postID uuid.UUID, commentID uuid.UUID) {
	h.BroadcastToPost(postID, map[string]any{
		"type":      "comment_deleted",
		"commentId": commentID.String(),
	})
}

func (h *PostHub) BroadcastCommentUpdated(postID uuid.UUID, comment any) {
	h.BroadcastToPost(postID, map[string]any{
		"type":    "comment_updated",
		"comment": comment,
	})
}
