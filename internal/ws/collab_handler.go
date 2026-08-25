package ws

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/coder/websocket"
)

func (s *Server) Collab(w http.ResponseWriter, r *http.Request) {
	group := r.PathValue("roomId")

	if group == "" {
		http.Error(w, "missing roomId", http.StatusBadRequest)
		return
	}

	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{
			os.Getenv("FRONTEND_URL"),
		},
	})
	if err != nil {
		return
	}
	defer c.CloseNow()

	room := s.createIfNotExist(group)
	sub := s.addSub(group)
	log.Printf("ROOM %s: handler started", group)

	defer func() {
		log.Printf("ROOM %s: handler returning", group)
		c.CloseNow()
		s.delSub(group, sub)
	}()
	ctx := r.Context()

	// Read messages FROM this client, broadcast to the room
	go func() {
		for {
			_, msg, err := c.Read(ctx)
			if err != nil {
				return
			}
			room.broadcast(msg, sub) // sub passed so broadcast can skip echoing back to sender
		}
	}()

	// Send messages to this client.

	for {
		select {
		case msg := <-sub.msgs:
			if err := writeTimeout(ctx, time.Second*5, c, msg); err != nil {
				log.Printf("ROOM %s: read error: %v", group, err)
				return
			}

		case <-ctx.Done():
			return
		}
	}
}

func (s *Server) createIfNotExist(group string) *room {
	s.roomsMu.Lock()
	defer s.roomsMu.Unlock()

	r, exists := s.rooms[group]
	if !exists {
		r = &room{
			subs: make(map[*sub]struct{}),
		}

		s.rooms[group] = r
	}

	return r
}

func (s *Server) addSub(group string) *sub {
	r := s.createIfNotExist(group)

	r.mu.Lock()
	defer r.mu.Unlock()

	newSub := &sub{
		msgs: make(chan []byte, 16),
		kick: func() {

		},
	}

	r.subs[newSub] = struct{}{}

	log.Printf("ROOM %s subscribers= %d", group, len(r.subs))

	return newSub
}

func (s *Server) delSub(group string, sub *sub) {
	r := s.createIfNotExist(group)

	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.subs, sub)

	log.Printf("ROOM %s subscribers= %d leave", group, len(r.subs))
}

func writeTimeout(
	ctx context.Context,
	timeout time.Duration,
	c *websocket.Conn,
	msg []byte,
) error {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	return c.Write(ctx, websocket.MessageBinary, msg)
}

func (r *room) broadcast(msg []byte, sender *sub) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for s := range r.subs {
		if s == sender {
			continue // don't echo back to whoever sent it
		}
		select {
		case s.msgs <- msg:
		default:
			s.kick()
		}
	}
}
