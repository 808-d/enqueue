package ws

import (
	"context"
	"encoding/json"
	"enqueue/internal/utils"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/coder/websocket"
	"github.com/google/uuid"
)

type NotificationHub struct {
	mu    sync.Mutex
	conns map[uuid.UUID]map[*websocket.Conn]struct{}
}
type subscriber struct {
	conn   *websocket.Conn
	msgs   chan []byte
	userID uuid.UUID
}

func NewNotificationHub() *NotificationHub {
	return &NotificationHub{
		conns: make(map[uuid.UUID]map[*websocket.Conn]struct{}),
	}
}

func (h *NotificationHub) register(userID uuid.UUID, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.conns[userID] == nil {
		h.conns[userID] = make(map[*websocket.Conn]struct{})
	}
	h.conns[userID][conn] = struct{}{}
}

func (h *NotificationHub) unregister(userID uuid.UUID, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	delete(h.conns[userID], conn)
	if len(h.conns[userID]) == 0 {
		delete(h.conns, userID)
	}
}

// PushToUser sends payload to every active connection for this user (multiple tabs supported).
func (h *NotificationHub) PushToUser(userID uuid.UUID, payload any) {
	h.mu.Lock()
	defer h.mu.Unlock()

	conns, ok := h.conns[userID]
	if !ok {
		return // user isn't currently connected — safe no-op, notification is already in Postgres
	}

	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("failed to marshal notification: %v", err)
		return
	}

	for conn := range conns {
		go func(c *websocket.Conn) {
			ctx, cancel := context.WithTimeout(context.Background(), timeoutWrite)
			defer cancel()
			if err := c.Write(ctx, websocket.MessageText, data); err != nil {
				log.Printf("failed to push notification: %v", err)
			}
		}(conn)
	}
}

func (h *NotificationHub) SubscribeHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := utils.GetUserIDFromAuth(r) // reuse your existing auth extraction
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{os.Getenv("FRONTEND_URL")},
	})
	if err != nil {
		return
	}
	defer conn.CloseNow()

	h.register(userID, conn)
	defer h.unregister(userID, conn)

	ctx := conn.CloseRead(context.Background()) // pure listener — client never sends data here
	<-ctx.Done()
}

const timeoutWrite = 5 * timeoutSecond

const timeoutSecond = 1_000_000_000 // 1 second, in time.Duration terms — replace with time.Second import
