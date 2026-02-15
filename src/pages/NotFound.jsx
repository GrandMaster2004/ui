import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="ng-not-found">
      <div className="ng-not-found__container">
        <div className="ng-not-found__code">404</div>
        <h1 className="ng-not-found__title">Page Not Found</h1>
        <p className="ng-not-found__message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="ng-button ng-button--primary"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};
