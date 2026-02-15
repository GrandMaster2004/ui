import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth.js";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { StackedCardsLoader } from "./components/UI.jsx";
import { LandingLayout } from "./layouts/LandingLayout.jsx";
import "./index.css";

// Lazy load pages to reduce initial bundle size
const LandingPage = lazy(() =>
  import("./pages/Landing.jsx").then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import("./pages/Auth.jsx").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/Auth.jsx").then((m) => ({ default: m.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/ForgotPassword.jsx").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/ResetPassword.jsx").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFound.jsx").then((m) => ({ default: m.NotFoundPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/Dashboard.jsx").then((m) => ({ default: m.DashboardPage })),
);
const AddCardsPage = lazy(() =>
  import("./pages/AddCards.jsx").then((m) => ({ default: m.AddCardsPage })),
);
const SubmissionReviewPage = lazy(() =>
  import("./pages/SubmissionReview.jsx").then((m) => ({
    default: m.SubmissionReviewPage,
  })),
);
const PaymentPage = lazy(() =>
  import("./pages/Payment.jsx").then((m) => ({ default: m.PaymentPage })),
);
const ConfirmationPage = lazy(() =>
  import("./pages/Confirmation.jsx").then((m) => ({
    default: m.ConfirmationPage,
  })),
);
const AdminPage = lazy(() =>
  import("./pages/Admin.jsx").then((m) => ({ default: m.AdminPage })),
);

function LandingRouteGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AuthRouteGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { user, isInitializing, logout, isAdmin } = useAuth();

  // Only show loader during initial auth check
  if (isInitializing) {
    return <StackedCardsLoader />;
  }

  return (
    <Router>
      <Suspense fallback={<StackedCardsLoader />}>
        <Routes>
          <Route element={<LandingLayout user={user} onLogout={logout} />}>
            <Route
              path="/"
              element={
                <LandingRouteGuard>
                  <LandingPage />
                </LandingRouteGuard>
              }
            />
            <Route
              path="/login"
              element={
                <AuthRouteGuard>
                  <LoginPage />
                </AuthRouteGuard>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRouteGuard>
                  <RegisterPage />
                </AuthRouteGuard>
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage user={user} onLogout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-cards"
            element={
              <ProtectedRoute>
                <AddCardsPage user={user} onLogout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/submission-review/:submissionId"
            element={
              <ProtectedRoute>
                <SubmissionReviewPage user={user} onLogout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/submission-review"
            element={
              <ProtectedRoute>
                <SubmissionReviewPage user={user} onLogout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage user={user} onLogout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <ConfirmationPage user={user} onLogout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage user={user} onLogout={logout} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
