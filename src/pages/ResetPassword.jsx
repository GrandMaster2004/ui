import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input } from "../components/UI.jsx";
import { apiCall } from "../utils/api.js";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await apiCall("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email, newPassword: password }),
      });

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-section">
      <div className="auth-card">
        <h1 className="auth-card__title">SET NEW PASSWORD</h1>

        {success ? (
          <div className="auth-card__success">
            <div className="auth-card__success-icon">✓</div>
            <p className="auth-card__success-text">
              Your password has been successfully reset. You can now login with
              your new password.
            </p>
            <Button
              variant="primary"
              className="ng-button--block auth-card__cta"
              onClick={() => navigate("/login")}
            >
              GO TO LOGIN
            </Button>
          </div>
        ) : (
          <>
            {error && <div className="auth-card__alert">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <p className="auth-card__description">
                Enter your new password below.
              </p>

              <Input
                type="password"
                label="NEW PASSWORD"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <Input
                type="password"
                label="CONFIRM PASSWORD"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />

              <Button
                variant="primary"
                className="ng-button--block auth-card__cta"
                type="submit"
                disabled={loading || !token || !email}
              >
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </Button>
            </form>

            <div className="auth-card__footer">
              <button type="button" onClick={() => navigate("/login")}>
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};
