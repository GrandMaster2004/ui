import { useState, useCallback } from "react";
import { apiCall } from "../utils/api.js";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const payNow = useCallback(async (submissionId, paymentMethodId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/payments/pay-now", {
        method: "POST",
        body: JSON.stringify({ submissionId, paymentMethodId }),
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPayment = useCallback(async (submissionId, paymentIntentId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/payments/confirm-payment", {
        method: "POST",
        body: JSON.stringify({ submissionId, paymentIntentId }),
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const payLater = useCallback(async (submissionId) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/payments/pay-later", {
        method: "POST",
        body: JSON.stringify({ submissionId }),
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPaymentMethod = useCallback(
    async (submissionId, setupIntentId, paymentMethodId) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiCall("/api/payments/confirm-payment-method", {
          method: "POST",
          body: JSON.stringify({
            submissionId,
            setupIntentId,
            paymentMethodId,
          }),
        });

        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    payNow,
    confirmPayment,
    payLater,
    confirmPaymentMethod,
  };
};
