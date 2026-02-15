import { useState, useCallback } from "react";
import { apiCall } from "../utils/api.js";

export const useAdmin = () => {
  const [submissions, setSubmissions] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });

  const fetchSubmissions = useCallback(async (page = 1, status = null) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (status) params.append("status", status);
      // NOTE: paymentStatus is NOT included - backend enforces paid-only filter

      const data = await apiCall(`/api/admin/submissions?${params}`);

      setSubmissions(data.submissions);
      setPagination({
        page: data.pagination.page,
        pageSize: data.pagination.pageSize,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });

      return data;
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch submissions";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubmissionStatus = useCallback(async (submissionId, status) => {
    // Store previous submissions for rollback on failure
    let previousSubmissions = null;

    // Optimistically update the UI immediately
    setSubmissions((prev) => {
      if (!prev) return prev;
      previousSubmissions = prev;
      return prev.map((sub) =>
        sub._id === submissionId
          ? { ...sub, submissionStatus: status }
          : sub,
      );
    });

    try {
      const data = await apiCall(
        `/api/admin/submissions/${submissionId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      // If the API returns the updated submission, reconcile with server data
      if (data?.submission) {
        setSubmissions((prev) => {
          if (!prev) return prev;
          return prev.map((sub) =>
            sub._id === submissionId
              ? {
                  ...sub,
                  submissionStatus: data.submission.submissionStatus ?? status,
                  paymentStatus: data.submission.paymentStatus ?? sub.paymentStatus,
                }
              : sub,
          );
        });
      }

      return data;
    } catch (err) {
      // Rollback to previous state on failure
      if (previousSubmissions) {
        setSubmissions(previousSubmissions);
      }
      const errorMsg = err.message || "Failed to update submission status";
      throw new Error(errorMsg);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setError(null);

    try {
      const data = await apiCall("/api/admin/analytics");
      setAnalytics(data.analytics);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch analytics";
      setError(errorMsg);
      throw err;
    }
  }, []);

  return {
    submissions,
    analytics,
    loading,
    error,
    pagination,
    fetchSubmissions,
    updateSubmissionStatus,
    fetchAnalytics,
  };
};
