package main

import (
	"encoding/hex"
	"testing"

	"enqueue/internal/utils"
)

func TestRoleString(t *testing.T) {
	if got := utils.RoleUser.String(); got != "user" {
		t.Errorf("RoleUser.String() = %q, want %q", got, "user")
	}
	if got := utils.RoleAdmin.String(); got != "admin" {
		t.Errorf("RoleAdmin.String() = %q, want %q", got, "admin")
	}
}

func TestIsValidRole(t *testing.T) {
	tests := []struct {
		role  string
		valid bool
	}{
		{"user", true},
		{"admin", true},
		{"", false},
		{"User", false},
		{"ADMIN", false},
		{"superuser", false},
	}

	for _, tt := range tests {
		if got := utils.IsValidRole(tt.role); got != tt.valid {
			t.Errorf("IsValidRole(%q) = %v, want %v", tt.role, got, tt.valid)
		}
	}
}

func TestHash256(t *testing.T) {
	// Known SHA-256 test vector.
	const want = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"

	if got := utils.Hash256("hello"); got != want {
		t.Errorf("Hash256(\"hello\") = %q, want %q", got, want)
	}

	if a, b := utils.Hash256("a"), utils.Hash256("b"); a == b {
		t.Error("Hash256 returned same digest for different inputs")
	}
}

func TestGenerateVerificationToken(t *testing.T) {
	tok, err := utils.GenerateVerificationToken()
	if err != nil {
		t.Fatalf("GenerateVerificationToken returned error: %v", err)
	}

	if len(tok) != 64 {
		t.Errorf("token length = %d, want 64", len(tok))
	}

	if _, err := hex.DecodeString(tok); err != nil {
		t.Errorf("token is not valid hex: %v", err)
	}
}
