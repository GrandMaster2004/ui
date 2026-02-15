import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";
import { usePayment } from "../hooks/usePayment.js";
import { useSubmissions } from "../hooks/useSubmissions.js";
import { sessionStorageManager } from "../utils/cache.js";

export const PaymentPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("pay_now");
  const [submissionData, setSubmissionData] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const {
    payNow,
    payLater,
    confirmPayment,
    loading: paymentLoading,
  } = usePayment();
  const {
    fetchSubmissions,
    createSubmission,
    loading: submissionLoading,
  } = useSubmissions();

  useEffect(() => {
    const loadUnpaidSubmission = async () => {
      try {
        const submissions = await fetchSubmissions(true);
        const unpaidSubmission = submissions.find(
          (sub) => sub.paymentStatus !== "paid",
        );

        if (unpaidSubmission && unpaidSubmission.cards) {
          const unpaidCards = (unpaidSubmission.cards || []).filter(
            (card) =>
              (!card.status || card.status === "unpaid") && !card.isDeleted,
          );

          if (unpaidCards.length === 0) {
            navigate("/dashboard");
            return;
          }

          setSubmissionData({
            ...unpaidSubmission,
            cards: unpaidCards,
            cardCount: unpaidCards.length,
          });
          return;
        }
      } catch (error) {
        console.error("Error loading unpaid submission:", error);
      }

      const cached = sessionStorageManager.getSubmissionForm();
      if (cached) {
        const unpaidCards = (cached.cards || []).filter(
          (card) =>
            (!card.status || card.status === "unpaid") && !card.isDeleted,
        );

        if (unpaidCards.length === 0) {
          navigate("/dashboard");
          return;
        }

        setSubmissionData({
          ...cached,
          cards: unpaidCards,
          cardCount: unpaidCards.length,
        });
      }
    };

    loadUnpaidSubmission();
  }, [fetchSubmissions, navigate]);

  const calculateTotal = () => {
    if (!submissionData) return 0;
    // Calculate only unpaid and non-deleted cards
    return (submissionData.cards || [])
      .filter(
        (card) => (!card.status || card.status === "unpaid") && !card.isDeleted,
      )
      .reduce((sum, card) => sum + (card.price || 0), 0);
  };

  const handlePayment = async () => {
    if (!submissionData) return;

    // Filter only unpaid cards for payment
    const unpaidCards = (submissionData.cards || []).filter(
      (card) => !card.status || card.status === "unpaid",
    );

    if (unpaidCards.length === 0) {
      navigate("/dashboard");
      return;
    }

    try {
      let submissionId = submissionData._id;
      if (!submissionId) {
        const submission = await createSubmission({
          cards: unpaidCards,
          cardCount: unpaidCards.length,
          serviceTier: submissionData.serviceTier,
        });
        submissionId = submission._id;
      }

      if (paymentMethod === "pay_now") {
        const payNowResult = await payNow(submissionId, "pm_card_visa");
        if (payNowResult?.paymentIntentId) {
          await confirmPayment(submissionId, payNowResult.paymentIntentId);
        }
      } else {
        await payLater(submissionId);
      }

      // Clear cache and navigate to confirmation
      sessionStorageManager.removeSubmissionForm();

      // Invalidate submissions cache to refresh unpaid cards
      sessionStorageManager.remove(
        sessionStorageManager.CACHE_KEYS.SUBMISSIONS,
      );

      navigate("/confirmation", { state: { submissionId } });
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  if (!submissionData) {
    return (
      <div className="loading-screen">
        <div className="stacked-cards">
          <div className="stacked-cards__card stacked-cards__card--top"></div>
          <div className="stacked-cards__card stacked-cards__card--middle"></div>
          <div className="stacked-cards__card stacked-cards__card--bottom"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="ng-app-shell ng-app-shell--dark payment-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <div className="payment-wrapper">
            <h1 className="ng-page-title payment-page__title">PAYMENT</h1>

            <div className="payment-container">
              <div className="payment-grid">
                <Card className="payment-card">
                  <h2>PAYMENT METHOD</h2>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="method"
                        value="pay_now"
                        checked={paymentMethod === "pay_now"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div>
                        <p>PAY NOW</p>
                        <span>
                          Charge card immediately. Processing begins right away.
                        </span>
                      </div>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="method"
                        value="pay_later"
                        checked={paymentMethod === "pay_later"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div>
                        <p>PAY LATER</p>
                        <span>
                          Initial charge covers processing. Pay the rest when
                          grading is complete.
                        </span>
                      </div>
                    </label>
                  </div>
                </Card>

                <Card className="payment-card">
                  <h2>CARD DETAILS</h2>
                  <div className="payment-fields">
                    <label className="payment-fields__label">CARD NUMBER</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(
                          e.target.value.replace(/\D/g, "").slice(0, 16),
                        )
                      }
                      className="payment-input"
                    />

                    <div className="payment-fields__row">
                      <div>
                        <label className="payment-fields__label">
                          EXP DATE
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "");
                            if (val.length >= 2) {
                              val = val.slice(0, 2) + "/" + val.slice(2, 4);
                            }
                            setCardExpiry(val);
                          }}
                          className="payment-input"
                        />
                      </div>
                      <div>
                        <label className="payment-fields__label">CVC</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) =>
                            setCardCvc(
                              e.target.value.replace(/\D/g, "").slice(0, 3),
                            )
                          }
                          className="payment-input"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="payment-summary">
                  <h2>ORDER SUMMARY</h2>
                  <div className="payment-summary__rows">
                    <div>
                      <span>Cards:</span>
                      <strong>
                        {submissionData.cardCount ??
                          submissionData.cards.length}
                      </strong>
                    </div>
                    {submissionData.cards &&
                      submissionData.cards.length > 0 && (
                        <div className="payment-summary__breakdown">
                          {submissionData.cards.map((card, i) => (
                            <div key={i} className="payment-summary__card">
                              <span>
                                {card.player} ({card.year})
                              </span>
                              <span>${card.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    <div className="payment-summary__total">
                      <span>TOTAL:</span>
                      <strong>${calculateTotal().toFixed(2)}</strong>
                    </div>
                  </div>
                </Card>

                <div className="payment-actions payment-actions--centered">
                  <Button
                    variant="primary"
                    className="payment-actions__button"
                    onClick={handlePayment}
                    disabled={
                      paymentLoading ||
                      submissionLoading ||
                      !cardNumber ||
                      !cardExpiry ||
                      !cardCvc
                    }
                  >
                    {paymentLoading
                      ? "PROCESSING..."
                      : paymentMethod === "pay_now"
                        ? "PAY NOW"
                        : "SAVE & CONTINUE"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="payment-actions__button"
                    onClick={() => navigate("/add-cards")}
                    disabled={paymentLoading}
                  >
                    BACK
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
