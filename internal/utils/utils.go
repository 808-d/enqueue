package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

func Hash256(str string) string {
	result := sha256.Sum256([]byte(str))
	return hex.EncodeToString(result[:])
}
