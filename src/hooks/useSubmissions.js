import { useState, useCallback } from "react";
import { apiCall } from "../utils/api.js";
import { sessionStorageManager } from "../utils/cache.js";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async (skipCache = false) => {
    // Check cache first and return immediately without loading state
    if (!skipCache) {
      const cached = sessionStorageManager.getSubmissions();
      if (cached) {
        setSubmissions(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/submissions");
      const submissions = data.submissions || [];
      sessionStorageManager.setSubmissions(submissions);
      setSubmissions(submissions);
      return submissions;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVaultSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/submissions/vault");
      const submissions = data.submissions || [];
      setSubmissions(submissions);
      return submissions;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaidSubmissions = useCallback(async () => {
    // Don't use global loading state - caller manages its own loading state
    // This prevents interference with fetchVaultSubmissions
    try {
      const data = await apiCall("/api/submissions/paid");
      return data.submissions || [];
    } catch (err) {
      console.error("Error fetching paid submissions:", err);
      throw err;
    }
  }, []);

  const fetchSubmissionById = useCallback(async (submissionId) => {
    try {
      const data = await apiCall(`/api/submissions/${submissionId}`);
      return data.submission || null;
    } catch (err) {
      console.error("Error fetching submission by ID:", err);
      throw err;
    }
  }, []);

  const fetchDashboardMetrics = useCallback(async () => {
    // Fetch pre-calculated metrics from backend
    try {
      const data = await apiCall("/api/submissions/metrics");
      return data;
    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
      throw err;
    }
  }, []);

  const createSubmission = useCallback(async (submission) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/submissions", {
        method: "POST",
        body: JSON.stringify(submission),
      });

      // Invalidate submissions cache
      sessionStorageManager.remove(
        sessionStorageManager.CACHE_KEYS.SUBMISSIONS,
      );

      return data.submission;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubmission = useCallback(async (submissionId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall(`/api/submissions/${submissionId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      // Invalidate submissions cache
      sessionStorageManager.remove(
        sessionStorageManager.CACHE_KEYS.SUBMISSIONS,
      );

      return data.submission;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    fetchVaultSubmissions,
    fetchPaidSubmissions,
    fetchSubmissionById,
    fetchDashboardMetrics,
    createSubmission,
    updateSubmission,
  };
};
