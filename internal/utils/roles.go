package utils

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

func (r Role) String() string {
	return string(r)
}

func IsValidRole(role string) bool {
	return role == string(RoleUser) || role == string(RoleAdmin)
}
