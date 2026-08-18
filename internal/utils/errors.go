package utils

import "errors"

var (
	ErrInvalidOrExpiredToken = errors.New("invalid or expired token")
	ErrUsernameTaken         = errors.New("username is already taken")
	ErrUnauthorized          = errors.New("unauthorized")
	ErrUserNotFound          = errors.New("user not found")
	ErrCannotFollowSelf      = errors.New("cannot follow yourself")
)
