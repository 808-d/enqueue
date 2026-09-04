package notifications

type NotiResponse struct {
	ID        string  `json:"id"`
	Type      string  `json:"type"`
	Message   string  `json:"message"`
	EntityID  string  `json:"entityId,omitempty"`
	ReadAt    *string `json:"readAt,omitempty"`
	CreatedAt string  `json:"createdAt"`
}
