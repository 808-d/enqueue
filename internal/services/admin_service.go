package services

import (
	"context"
	"enqueue/internal/database"
	"enqueue/internal/utils"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

type AdminService struct {
	repo *database.Queries
	db   *pgxpool.Pool
	rdb  *redis.Client
}

func NewAdminService(pool *pgxpool.Pool, rdb *redis.Client) *AdminService {
	return &AdminService{repo: database.New(pool), db: pool, rdb: rdb}
}

func (s *AdminService) AdminLogin(ctx context.Context, username string, password string) (database.User, error) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return database.User{}, errors.New("invalid username or password")
	}
	if user.Role != string(utils.RoleAdmin) {

		return database.User{}, errors.New("This account doesn't have right to access this page!")
	}

	// Verify password using bcrypt
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password.String),
		[]byte(password),
	); err != nil {
		return database.User{}, errors.New("invalid username or password")
	}

	return user, nil
}

func (s *AdminService) RequestPasswordReset(ctx context.Context, username string) error {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		// user not found — silently return nil so the handler's generic response holds
		return nil
	}

	if user.Role != "admin" {
		return nil // don't reveal if user is not admin
	}

	token, err := utils.GenerateVerificationToken()
	if err != nil {
		return err
	}

	if err := s.rdb.Set(ctx, "admin_reset_password:"+token, user.ID.String(), time.Minute*15).Err(); err != nil {
		return err
	}

	return utils.SendEmail(
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("APP_PASSWORD"),
		user.Email,
		"Reset your Enqueue admin password",
		fmt.Sprintf(`Hi,

		We received a request to reset your Enqueue admin password. Click the link below to choose a new one:

		%s/admin/reset-password?token=%s

		If you didn't request this, you can safely ignore this email — your password will not change.

		This link expires in 15 minutes.

		Thanks,
		The Enqueue team`, os.Getenv("FRONTEND_URL"), token),
	)
}

func (s *AdminService) ResetPassword(
	ctx context.Context,
	token string,
	password string,
) error {
	userID, err := s.rdb.Get(
		ctx,
		"admin_reset_password:"+token,
	).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return utils.ErrInvalidResetToken
		}

		return fmt.Errorf("get reset token: %w", err)
	}

	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return fmt.Errorf("invalid user id in reset token: %w", err)
	}

	hashPassword, err := utils.HashPassword(password)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	err = s.repo.UpdatePassword(ctx, database.UpdatePasswordParams{
		ID: pgtype.UUID{
			Bytes: parsedUserID,
			Valid: true,
		},
		Password: pgtype.Text{
			String: hashPassword,
			Valid:  true,
		},
	})
	if err != nil {
		return fmt.Errorf("update password: %w", err)
	}

	// Token is one-time use.
	if err := s.rdb.Del(
		ctx,
		"admin_reset_password:"+token,
	).Err(); err != nil {
		return fmt.Errorf("delete reset token: %w", err)
	}

	return nil
}

func (s *AdminService) GetStatistics(ctx context.Context) (AdminStatistics, error) {
	totalPosts, err := s.repo.GetTotalPosts(ctx)
	if err != nil {
		return AdminStatistics{}, err
	}

	totalUsers, err := s.repo.GetTotalUsers(ctx)
	if err != nil {
		return AdminStatistics{}, err
	}

	totalComments, err := s.repo.GetTotalComments(ctx)
	if err != nil {
		return AdminStatistics{}, err
	}

	postsOverTime, err := s.repo.GetPostsOverTime(ctx)
	if err != nil {
		return AdminStatistics{}, err
	}

	usersOverTime, err := s.repo.GetUsersOverTime(ctx)
	if err != nil {
		return AdminStatistics{}, err
	}

	return AdminStatistics{
		TotalPosts:    totalPosts,
		TotalUsers:    totalUsers,
		TotalComments: totalComments,
		PostsOverTime: convertPostsTimeSeries(postsOverTime),
		UsersOverTime: convertUsersTimeSeries(usersOverTime),
	}, nil
}

func (s *AdminService) ListUsers(ctx context.Context, page, pageSize int) (AdminUsersPage, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	total, err := s.repo.CountUsers(ctx)
	if err != nil {
		return AdminUsersPage{}, err
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	users, err := s.repo.AdminListUsers(ctx, database.AdminListUsersParams{
		Limit:  int32(pageSize),
		Offset: int32(offset),
	})
	if err != nil {
		return AdminUsersPage{}, err
	}

	return AdminUsersPage{
		Users:       users,
		TotalCount:  total,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}, nil
}

func convertPostsTimeSeries(rows []database.GetPostsOverTimeRow) []TimeSeriesPoint {
	var result []TimeSeriesPoint
	for _, row := range rows {
		result = append(result, TimeSeriesPoint{
			Date:  row.Date.Time.Format("2006-01-02"),
			Count: row.Count,
		})
	}
	return result
}

func convertUsersTimeSeries(rows []database.GetUsersOverTimeRow) []TimeSeriesPoint {
	var result []TimeSeriesPoint
	for _, row := range rows {
		result = append(result, TimeSeriesPoint{
			Date:  row.Date.Time.Format("2006-01-02"),
			Count: row.Count,
		})
	}
	return result
}

type AdminStatistics struct {
	TotalPosts    int64             `json:"totalPosts"`
	TotalUsers    int64             `json:"totalUsers"`
	TotalComments int64             `json:"totalComments"`
	PostsOverTime []TimeSeriesPoint `json:"postsOverTime"`
	UsersOverTime []TimeSeriesPoint `json:"usersOverTime"`
}

type TimeSeriesPoint struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type AdminUsersPage struct {
	Users       []database.AdminListUsersRow `json:"users"`
	TotalCount  int64                        `json:"totalCount"`
	TotalPages  int                          `json:"totalPages"`
	CurrentPage int                          `json:"currentPage"`
	PageSize    int                          `json:"pageSize"`
}
