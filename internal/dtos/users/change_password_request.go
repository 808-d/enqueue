package users

type ChangePasswordRequest struct {
	Passowrd    string `json:"currentPassword"`
	NewPassowrd string `json:"newPassword"`
}
