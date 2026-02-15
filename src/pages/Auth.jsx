import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, PasswordInput } from "../components/UI.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { PasswordVisibilityProvider } from "../hooks/usePasswordVisibility.jsx";

const ADMIN_CREDENTIALS = {
  email: "yashvardhangond95@gmail.com",
  password: "12345678",
};

const buildAuthErrorMessage = (err) => {
  const rawMessage = err?.message || "Authentication failed";
  const errorMessage = rawMessage.toLowerCase();

  if (
    errorMessage.includes("email") &&
    (errorMessage.includes("not found") ||
      errorMessage.includes("does not exist") ||
      errorMessage.includes("not exist"))
  ) {
    return "❌ Email not found. Please check your email or create a new account.";
  }

  if (
    errorMessage.includes("password") &&
    (errorMessage.includes("incorrect") ||
      errorMessage.includes("invalid") ||
      errorMessage.includes("wrong"))
  ) {
    return "❌ Incorrect password. Please try again.";
  }

  if (
    errorMessage.includes("credentials") ||
    errorMessage.includes("unauthorized")
  ) {
    return "❌ Invalid email or password. Please check your credentials.";
  }

  if (errorMessage.includes("email") && errorMessage.includes("exists")) {
    return "❌ Email already registered. Please login instead.";
  }

  if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
    return "❌ Network error. Please check your connection and try again.";
  }

  if (errorMessage.includes("500") || errorMessage.includes("server")) {
    return "❌ Server error. Please try again later.";
  }

  return `❌ ${rawMessage || "Authentication failed. Please try again."}`;
};

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [errors, setErrors] = useState({});
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAuthAction, setActiveAuthAction] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setIsRegister(mode === "register");
    setErrors({});
  }, [mode]);

  const validateForm = () => {
    const newErrors = {};

    if (isRegister && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Only clear field-specific errors, not the submit error
    if (errors[name] && name !== "submit") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Start loading state
    setActiveAuthAction("user");
    setIsSubmitting(true);

    try {
      let user;
      if (isRegister) {
        user = await register(formData.name, formData.email, formData.password);
      } else {
        user = await login(formData.email, formData.password);
      }

      // Only navigate on successful authentication
      if (user && user.role) {
        // Navigate immediately - auth state is now updated
        // ProtectedRoute will check isInitializing to prevent flicker
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      // Stop loading immediately on error
      setIsSubmitting(false);
      setActiveAuthAction(null);

      // Stay on page and show error - do NOT navigate
      const displayError = buildAuthErrorMessage(err);
      setErrors({ submit: displayError });

      // Ensure we stop loading and don't proceed
      return;
    }
  };

  const handleAdminLogin = async () => {
    if (isRegister || isSubmitting) {
      return;
    }

    // Clear previous errors to focus on the admin action result
    setErrors({});
    setActiveAuthAction("admin");
    setIsSubmitting(true);

    try {
      const user = await login(
        ADMIN_CREDENTIALS.email,
        ADMIN_CREDENTIALS.password,
      );

      if (user && user.role) {
        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setActiveAuthAction(null);
      setErrors({ submit: buildAuthErrorMessage(err) });
    }
  };

  return (
    <main className="auth-section">
      <div className="auth-card">
        <h1 className="auth-card__title">
          {isRegister ? "CREATE ACCOUNT" : "LOGIN"}
        </h1>

        {/* Error display - Multiple methods to ensure visibility */}
        {errors.submit && (
          <>
            <div
              className="auth-card__alert"
              role="alert"
              style={{
                background: "rgba(239, 68, 68, 0.4)",
                border: "3px solid #ef4444",
                color: "#ffffff",
                padding: "1rem",
                borderRadius: "0.85rem",
                marginBottom: "1.5rem",
                fontSize: "0.95rem",
                fontWeight: "600",
                textAlign: "center",
                display: "block",
                zIndex: 1000,
              }}
            >
              {errors.submit}
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <Input
              name="name"
              label="NAME"
              placeholder="Your name"
              required
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              disabled={isSubmitting}
            />
          )}

          <Input
            type="email"
            name="email"
            label={isRegister ? "EMAIL" : "EMAIL & PASSWORD"}
            placeholder={
              isRegister ? "your@email.com" : "Email & password fields"
            }
            required
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isSubmitting}
          />

          <PasswordInput
            name="password"
            label={isRegister ? "PASSWORD" : ""}
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            disabled={isSubmitting}
          />

          {isRegister && (
            <PasswordInput
              name="confirmPassword"
              label="CONFIRM PASSWORD"
              placeholder="Confirm password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              disabled={isSubmitting}
            />
          )}

          <Button
            variant="primary"
            className="ng-button--block auth-card__cta"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "PLEASE WAIT..."
              : isRegister
                ? "CREATE ACCOUNT"
                : "LOGIN"}
          </Button>

          {!isRegister && (
            <Button
              variant="secondary"
              className="ng-button--block auth-card__cta"
              type="button"
              onClick={handleAdminLogin}
              disabled={isSubmitting}
            >
              {isSubmitting && activeAuthAction === "admin"
                ? "LOGGING IN AS ADMIN..."
                : "LOGIN AS ADMIN"}
            </Button>
          )}
        </form>

        <div className="auth-card__footer">
          <button
            type="button"
            onClick={() => navigate(isRegister ? "/login" : "/register")}
          >
            {isRegister
              ? "Already have an account? Login"
              : "New here? Create account"}
          </button>
        </div>

        {!isRegister && (
          <a href="/forgot-password" className="auth-card__link">
            Forgot password?
          </a>
        )}
      </div>
    </main>
  );
};

export const LoginPage = () => (
  <PasswordVisibilityProvider>
    <AuthPage mode="login" />
  </PasswordVisibilityProvider>
);

export const RegisterPage = () => (
  <PasswordVisibilityProvider>
    <AuthPage mode="register" />
  </PasswordVisibilityProvider>
);
