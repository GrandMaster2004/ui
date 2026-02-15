import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";

export const ConfirmationPage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="ng-app-shell admin-page confirmation-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section confirmation-content">
          <div className="confirmation-hero">
            <div className="confirmation-symbol">✓</div>
            <h1 className="confirmation-title">SUBMISSION CONFIRMED</h1>
            <p className="confirmation-text">
              Your grading submission has been received. We'll notify you as it
              progresses through our system.
            </p>

            <Card className="confirmation-steps">
              <div className="confirmation-steps__header">NEXT STEPS</div>
              <ul className="confirmation-list">
                <li>✓ Package your cards securely</li>
                <li>✓ Ship to our facility within 5 days</li>
                <li>✓ Track your submission in your dashboard</li>
                <li>✓ Receive graded cards at completion</li>
              </ul>
            </Card>

            <div className="confirmation-actions">
              <Button
                variant="primary"
                onClick={() => navigate("/dashboard")}
                className="confirmation-actions__button"
              >
                VIEW DASHBOARD
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/add-cards")}
                className="confirmation-actions__button"
              >
                SUBMIT MORE CARDS
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
