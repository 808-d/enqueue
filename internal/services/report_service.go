package services

import (
	"context"
	"encoding/json"
	"enqueue/internal/database"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReportService struct {
	repo *database.Queries
	db   *pgxpool.Pool
}

func NewReportService(pool *pgxpool.Pool) *ReportService {
	return &ReportService{repo: database.New(pool), db: pool}
}

func (s *ReportService) CreateReport(
	ctx context.Context,
	reporterID uuid.UUID,
	reportedUserID uuid.UUID,
	reason string,
	details string,
) error {
	report, err := s.repo.AddReport(ctx, database.AddReportParams{
		ReporterID:     pgtype.UUID{Bytes: reporterID, Valid: true},
		ReportedUserID: pgtype.UUID{Bytes: reportedUserID, Valid: true},
		Reason:         reason,
		Details:        pgtype.Text{String: details, Valid: true},
	})
	if err != nil {
		return err
	}

	s.logAudit(ctx, ActionCreate, EntityReport, reporterID, nil, report)

	return nil
}

type ReportsPageResult struct {
	Reports     []database.GetReportsRow `json:"reports"`
	TotalCount  int64                    `json:"totalCount"`
	TotalPages  int                      `json:"totalPages"`
	CurrentPage int                      `json:"currentPage"`
	PageSize    int                      `json:"pageSize"`
}

func (s *ReportService) GetReports(ctx context.Context, page, pageSize int) (ReportsPageResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	totalCount, err := s.repo.CountReports(ctx)
	if err != nil {
		return ReportsPageResult{}, err
	}

	totalPages := int((totalCount + int64(pageSize) - 1) / int64(pageSize))

	reports, err := s.repo.GetReports(ctx, database.GetReportsParams{
		Limit:  int32(pageSize),
		Offset: int32(offset),
	})
	if err != nil {
		return ReportsPageResult{}, err
	}
	if reports == nil {
		reports = []database.GetReportsRow{}
	}

	return ReportsPageResult{
		Reports:     reports,
		TotalCount:  totalCount,
		TotalPages:  totalPages,
		CurrentPage: page,
		PageSize:    pageSize,
	}, nil
}

func (s *ReportService) UpdateReportStatus(ctx context.Context, reportID uuid.UUID, status int32, resolverID uuid.UUID) (database.UpdateReportRow, error) {
	updated, err := s.repo.UpdateReport(ctx, database.UpdateReportParams{
		ID:         pgtype.UUID{Bytes: reportID, Valid: true},
		Status:     status,
		ResolvedBy: pgtype.UUID{Bytes: resolverID, Valid: true},
	})
	if err != nil {
		return database.UpdateReportRow{}, err
	}

	s.logAudit(ctx, ActionUpdate, EntityReport, resolverID, nil, map[string]any{
		"report_id": reportID.String(),
		"status":    status,
	})

	return updated, nil
}

func (s *ReportService) logAudit(ctx context.Context, action Action, entity EntityName, userID uuid.UUID, oldVal any, newVal any) {
	oldJSON, _ := json.Marshal(oldVal)
	newJSON, _ := json.Marshal(newVal)

	_ = s.repo.AddAuditLog(ctx, database.AddAuditLogParams{
		Action:     string(action),
		EntityName: string(entity),
		OldValue:   oldJSON,
		NewValue:   newJSON,
		CreateBy:   pgtype.UUID{Bytes: userID, Valid: true},
	})
}
