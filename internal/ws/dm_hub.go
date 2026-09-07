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

type DirectMessageHub struct {
	mu    sync.Mutex
	conns map[string]map[*dmUser]struct{} // key = conversationKey(user1, user2)
}

type dmUser struct {
	userID uuid.UUID
	msgs   chan []byte
}

func NewDirectMessageHub() *DirectMessageHub {
	return &DirectMessageHub{
		conns: make(map[string]map[*dmUser]struct{}),
	}
}

func conversationKey(u1, u2 uuid.UUID) string {
	if u1.String() < u2.String() {
		return u1.String() + ":" + u2.String()
	}
	return u2.String() + ":" + u1.String()
}

func (h *DirectMessageHub) EnterHandler(w http.ResponseWriter, r *http.Request) {
	userId1, err := utils.GetUserIDFromAuth(r)

	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userId2, err := uuid.Parse(r.PathValue("userId2"))
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

	sub := h.enter(userId1, userId2)

	defer h.leave(userId1, userId2, sub)
	ctx := r.Context()
	for {
		select {
		case msg := <-sub.msgs:
			if err := conn.Write(ctx, websocket.MessageText, msg); err != nil {
				return
			}
		case <-ctx.Done():
			return
		}
	}

}

func (h *DirectMessageHub) enter(u1, u2 uuid.UUID) *dmUser {
	key := conversationKey(u1, u2)
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.conns[key] == nil {
		h.conns[key] = make(map[*dmUser]struct{})
	}

	sub := &dmUser{userID: u1, msgs: make(chan []byte, 16)}
	h.conns[key][sub] = struct{}{}
	return sub
}

func (h *DirectMessageHub) leave(u1, u2 uuid.UUID, sub *dmUser) {
	key := conversationKey(u1, u2)
	h.mu.Lock()
	defer h.mu.Unlock()

	delete(h.conns[key], sub)
	if len(h.conns[key]) == 0 {
		delete(h.conns, key)
	}
}

func (h *DirectMessageHub) PushMessage(u1, u2 uuid.UUID, payload any) {
	key := conversationKey(u1, u2)

	h.mu.Lock()
	defer h.mu.Unlock()

	subs, ok := h.conns[key]
	if !ok {
		return
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return
	}

	for sub := range subs {
		select {
		case sub.msgs <- data:
		default:
		}
	}
}
