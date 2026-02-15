import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../components/UI.jsx";
import { apiCall } from "../utils/api.js";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await apiCall("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-section">
      <div className="auth-card">
        <h1 className="auth-card__title">RESET PASSWORD</h1>

        {success ? (
          <div className="auth-card__success">
            <div className="auth-card__success-icon">✓</div>
            <p className="auth-card__success-text">
              Password reset link has been sent to your email. Please check your
              inbox.
            </p>
            <Button
              variant="primary"
              className="ng-button--block auth-card__cta"
              onClick={() => navigate("/login")}
            >
              BACK TO LOGIN
            </Button>
          </div>
        ) : (
          <>
            {error && <div className="auth-card__alert">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <p className="auth-card__description">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <Input
                type="email"
                name="email"
                label="EMAIL ADDRESS"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <Button
                variant="primary"
                className="ng-button--block auth-card__cta"
                type="submit"
                disabled={loading}
              >
                {loading ? "SENDING..." : "SEND RESET LINK"}
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
