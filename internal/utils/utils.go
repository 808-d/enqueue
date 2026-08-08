package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"net/smtp"
)

func Hash256(str string) string {
	result := sha256.Sum256([]byte(str))
	return hex.EncodeToString(result[:])
}

func SendEmail(sender, password, receiver, subject, body string) error {
	auth := smtp.PlainAuth("", sender, password, "smtp.gmail.com")

	msg := []byte(
		"From: " + sender + "\r\n" +
			"To: " + receiver + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-Version: 1.0\r\n" +
			"Content-Type: text/plain; charset=UTF-8\r\n" +
			"\r\n" +
			body,
	)

	return smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		sender,
		[]string{receiver},
		msg,
	)
}

func GenerateVerificationToken() (string, error) {
	bytes := make([]byte, 32)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}
