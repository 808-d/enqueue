package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"enqueue/internal/services"

	"github.com/google/uuid"
)

type ReportHandler struct {
	reportService *services.ReportService
}

func NewReportHandler(reportService *services.ReportService) *ReportHandler {
	return &ReportHandler{reportService: reportService}
}

func (h *ReportHandler) CreateReport(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ReportedUserID string `json:"reportedUserId"`
		Reason         string `json:"reason"`
		Details        string `json:"details"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.ReportedUserID == "" || req.Reason == "" {
		http.Error(w, "reported user id and reason are required", http.StatusBadRequest)
		return
	}

	reporterID := r.Context().Value("id").(uuid.UUID)
	reportedUserID, err := uuid.Parse(req.ReportedUserID)
	if err != nil {
		http.Error(w, "invalid reported user id", http.StatusBadRequest)
		return
	}

	err = h.reportService.CreateReport(r.Context(), reporterID, reportedUserID, req.Reason, req.Details)
	if err != nil {
		log.Printf("failed to create report: %v", err)
		http.Error(w, "failed to create report", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

func (h *ReportHandler) GetReports(w http.ResponseWriter, r *http.Request) {
	page := 1
	if p := r.URL.Query().Get("page"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v > 0 {
			page = v
		}
	}

	pageSize := 20
	if ps := r.URL.Query().Get("page_size"); ps != "" {
		if v, err := strconv.Atoi(ps); err == nil && v > 0 && v <= 100 {
			pageSize = v
		}
	}

	result, err := h.reportService.GetReports(r.Context(), page, pageSize)
	if err != nil {
		log.Printf("failed to get reports: %v", err)
		http.Error(w, "failed to get reports", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *ReportHandler) UpdateReportStatus(w http.ResponseWriter, r *http.Request) {
	reportID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid report id", http.StatusBadRequest)
		return
	}

	var req struct {
		Status int32 `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	resolverID := r.Context().Value("id").(uuid.UUID)

	updated, err := h.reportService.UpdateReportStatus(r.Context(), reportID, req.Status, resolverID)
	if err != nil {
		log.Printf("failed to update report status: %v", err)
		http.Error(w, "failed to update report status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}
