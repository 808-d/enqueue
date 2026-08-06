package utils

import (
	"crypto/sha256"
)

func Hash256(str *string) string {
	result := sha256.Sum256([]byte(*str))
	return string(result[:])
}
