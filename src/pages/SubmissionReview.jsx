import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button, Card, StackedCardsLoader } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";
import { sessionStorageManager } from "../utils/cache.js";
import { useSubmissions } from "../hooks/useSubmissions.js";

export const SubmissionReviewPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submissionId } = useParams();
  const [formData, setFormData] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const lastLoadedSubmissionRef = useRef(null);
  const { fetchSubmissions, fetchSubmissionById } = useSubmissions();
  const isDetailView = Boolean(submissionId);

  const filterCards = (cards, { unpaidOnly } = {}) =>
    (cards || []).filter(
      (card) =>
        !card?.isDeleted &&
        (!unpaidOnly || !card.status || card.status === "unpaid"),
    );

  const computePricing = (submissionPricing, cards = []) => {
    if (submissionPricing) {
      return submissionPricing;
    }

    const basePrice = cards.reduce((sum, card) => sum + (card.price || 0), 0);
    const processingFee = 0;
    return {
      basePrice,
      processingFee,
      total: basePrice + processingFee,
    };
  };

  const applySubmissionPayload = (
    submission,
    { enforceUnpaidCards = !isDetailView } = {},
  ) => {
    if (!submission) {
      return false;
    }

    const visibleCards = filterCards(submission.cards, {
      unpaidOnly: enforceUnpaidCards,
    });

    if (enforceUnpaidCards && visibleCards.length === 0) {
      navigate("/dashboard");
      return false;
    }

    setFormData({
      ...submission,
      cards: visibleCards,
      cardCount: visibleCards.length,
    });
    setPricing(computePricing(submission.pricing, visibleCards));
    return true;
  };

  const handleBackNavigation = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    if (lastLoadedSubmissionRef.current === submissionId) return;
    lastLoadedSubmissionRef.current = submissionId;
    setFormData(null);
    setNotFound(false);

    const loadSubmission = async () => {
      try {
        if (submissionId) {
          const submission = await fetchSubmissionById(submissionId);

          if (
            !applySubmissionPayload(submission, { enforceUnpaidCards: false })
          ) {
            return;
          }

          return;
        }

        if (location.state?.submission) {
          if (
            applySubmissionPayload(location.state.submission, {
              enforceUnpaidCards: true,
            })
          ) {
            return;
          }
        }

        if (location.state?.cards) {
          if (
            applySubmissionPayload(
              {
                cards: location.state.cards,
                cardCount:
                  location.state.cardCount || location.state.cards.length,
                pricing: location.state.pricing || null,
                serviceTier: location.state.serviceTier,
              },
              { enforceUnpaidCards: true },
            )
          ) {
            return;
          }
        }

        const submissions = await fetchSubmissions(false);
        const unpaidSubmission = submissions.find(
          (sub) => sub.paymentStatus !== "paid",
        );

        if (
          applySubmissionPayload(unpaidSubmission, { enforceUnpaidCards: true })
        ) {
          return;
        }
      } catch (error) {
        console.error("Error loading submission review:", error);
      }

      const cached = sessionStorageManager.getSubmissionForm();
      if (
        applySubmissionPayload(cached, {
          enforceUnpaidCards: true,
        })
      ) {
        return;
      }

      setNotFound(true);
    };

    loadSubmission();
  }, [submissionId]);

  const isPaidSubmission = formData?.paymentStatus?.toLowerCase() === "paid";

  const handleProceedToPayment = () => {
    navigate("/payment", { state: { formData, pricing } });
  };

  const handleSaveAndExit = () => {
    sessionStorageManager.removeSubmissionForm();
    navigate("/dashboard");
  };

  if (notFound) {
    return (
      <div className="ng-app-shell ng-app-shell--dark review-page">
        <Header user={user} onLogout={onLogout} />
        <Container>
          <div className="ng-section">
            <div className="review-container" style={{ textAlign: "center" }}>
              <h1 className="ng-page-title">Submission Not Found</h1>
              <p style={{ marginBottom: "2rem" }}>
                The submission you're looking for doesn't exist or has been
                deleted.
              </p>
              <Button
                variant="secondary"
                className="review-actions__button"
                onClick={handleBackNavigation}
              >
                ← BACK TO DASHBOARD
              </Button>
            </div>
          </div>
        </Container>
        <LandingFooter />
      </div>
    );
  }

  if (!formData) {
    return <StackedCardsLoader />;
  }

  return (
    <div className="ng-app-shell ng-app-shell--dark review-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <h1 className="ng-page-title review-page__title">
            SUBMISSION REVIEW
          </h1>

          <div className="review-container">
            <div className="review-grid">
              <Card className="review-summary">
                <h2>ORDER SUMMARY</h2>
                <div className="review-summary__content">
                  <div>
                    <p>NUMBER OF CARDS:</p>
                    <span>
                      {(formData.cardCount ?? formData.cards.length) || 0} cards
                    </span>
                  </div>
                  {formData.cards?.length > 0 && (
                    <div>
                      <p>(OPTIONAL) CARD LIST:</p>
                      <div className="review-summary__list">
                        {formData.cards.map((card, i) => (
                          <p key={i}>
                            {card.player}, {card.year}, {card.set} #
                            {card.cardNumber}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  {pricing && (
                    <div className="review-summary__pricing">
                      <p>PRICING CALCULATION:</p>
                      <span>Cards with individual prices</span>
                      <span>Subtotal: ${pricing.basePrice}</span>
                      <div className="review-summary__total">
                        FINAL ORDER TOTAL: ${pricing.total}
                        <em>ESTIMATED</em>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="review-details">
                <h2>SUMMARY</h2>
                <div className="review-details__list">
                  {formData.cards?.length > 0 ? (
                    formData.cards.map((card, i) => (
                      <div className="review-details__item" key={i}>
                        <p>{card.player}</p>
                        <span>
                          {card.year} • {card.set} • #{card.cardNumber}
                        </span>
                        <span className="review-details__price">
                          ${card.price}
                        </span>
                        {card.notes && <small>{card.notes}</small>}
                      </div>
                    ))
                  ) : (
                    <div className="review-details__item">
                      <p>Cards listed by total count only.</p>
                      <span>Total cards: {(formData.cardCount ?? 0) || 0}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="review-actions">
              {isPaidSubmission ? (
                <Button
                  variant="secondary"
                  className="review-actions__button"
                  onClick={handleBackNavigation}
                >
                  ← BACK
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    className="review-actions__button"
                    onClick={handleSaveAndExit}
                  >
                    SAVE AND EXIT
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleProceedToPayment}
                    className="review-actions__button"
                  >
                    CONTINUE TO REVIEW →
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
