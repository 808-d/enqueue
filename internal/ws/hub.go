package ws

import (
	"net/http"
	"sync"
)

type Server struct {
	roomsMu sync.Mutex
	rooms   map[string]*room // keyed by postId
}

type sub struct {
	msgs chan []byte
	kick func()
}
type room struct {
	mu   sync.Mutex
	subs map[*sub]struct{}
}

func NewServer() *Server {
	s := &Server{
		rooms: make(map[string]*room),
	}
	return s
}

func (s *Server) CollabHandler(w http.ResponseWriter, r *http.Request) {
	s.Collab(w, r)
}
