import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card, StackedCardsLoader } from "../components/UI.jsx";
import { sessionStorageManager } from "../utils/cache.js";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";
import { useSubmissions } from "../hooks/useSubmissions.js";

export const AddCardsPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [cardForm, setCardForm] = useState({
    player: "",
    year: "",
    set: "",
    cardNumber: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const serviceTier = "THE_STANDARD";
  const hasMountedRef = useRef(false);
  const { fetchSubmissions, createSubmission, updateSubmission } =
    useSubmissions();

  // Load unpaid cards only once on mount, try cache first
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    const loadUnpaidCards = async () => {
      try {
        // Try cache first (skipCache = false uses cache)
        const submissions = await fetchSubmissions(false);

        if (submissions && submissions.length > 0) {
          // Find the first unpaid submission
          const unpaidSubmission = submissions.find(
            (sub) => sub.paymentStatus !== "paid",
          );

          if (unpaidSubmission && unpaidSubmission.cards) {
            // Store the submission ID for updates
            setCurrentSubmissionId(unpaidSubmission._id);

            const unpaidCards = unpaidSubmission.cards
              .filter(
                (card) =>
                  (!card.status || card.status === "unpaid") && !card.isDeleted,
              )
              .map((card) => ({
                ...card,
                id: card.id || Date.now() + Math.random(),
                status: "unpaid",
                createdAt: card.createdAt || new Date().toISOString(),
              }));

            setCards(unpaidCards);
            setLoading(false);
            return;
          }
        }

        // Fallback to sessionStorage if no unpaid submission
        const cached = sessionStorageManager.getSubmissionForm();
        if (cached && cached.cards) {
          const cachedUnpaid = cached.cards.filter(
            (card) =>
              (!card.status || card.status === "unpaid") && !card.isDeleted,
          );
          setCards(cachedUnpaid);
        }
      } catch (error) {
        console.error("Error loading unpaid cards:", error);
        // Fallback to sessionStorage on error
        const cached = sessionStorageManager.getSubmissionForm();
        if (cached && cached.cards) {
          const cachedUnpaid = cached.cards.filter(
            (card) =>
              (!card.status || card.status === "unpaid") && !card.isDeleted,
          );
          setCards(cachedUnpaid);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUnpaidCards();
  }, []); // Only run once on mount

  const getUnpaidCards = (submission) =>
    (submission?.cards || []).filter(
      (card) => (!card.status || card.status === "unpaid") && !card.isDeleted,
    );

  const syncCardsFromSubmission = (submission) => {
    const unpaidCards = getUnpaidCards(submission);
    setCards(unpaidCards);
    sessionStorageManager.setSubmissionForm({
      cards: unpaidCards,
      cardCount: unpaidCards.length,
      serviceTier,
    });
  };

  const persistCards = async (cardsToSave, cardCountOverride) => {
    const payload = {
      cards: cardsToSave,
      cardCount: cardCountOverride ?? cardsToSave.length,
      serviceTier,
    };

    if (currentSubmissionId) {
      return updateSubmission(currentSubmissionId, payload);
    }

    const created = await createSubmission(payload);
    setCurrentSubmissionId(created._id);
    return created;
  };

  const handleFieldChange = (field, value) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateCardForm = () => {
    const newErrors = {};

    if (!cardForm.player) {
      newErrors.player = "Required";
    } else if (cardForm.player.length < 3) {
      newErrors.player = "Minimum 3 characters required.";
    } else if (!/^[a-zA-Z\s]+$/.test(cardForm.player)) {
      newErrors.player = "Only alphabets allowed.";
    }

    if (!cardForm.year) {
      newErrors.year = "Required";
    } else if (!/^\d{4}$/.test(cardForm.year)) {
      newErrors.year = "Year must be exactly 4 digits.";
    }

    if (!cardForm.set) newErrors.set = "Required";

    if (!cardForm.cardNumber) {
      newErrors.cardNumber = "Required";
    } else if (cardForm.cardNumber.length !== 6) {
      newErrors.cardNumber = "Card ID must be exactly 6 characters.";
    } else if (!/^[a-zA-Z0-9]{6}$/.test(cardForm.cardNumber)) {
      newErrors.cardNumber = "Only alphanumeric characters allowed.";
    }

    return newErrors;
  };

  const handleAddOrUpdate = async () => {
    if (!selectedPrice) {
      setErrors((prev) => ({
        ...prev,
        price: "Select a price before adding/updating this card",
      }));
      return;
    }

    const formErrors = validateCardForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});

    const cardPayload = {
      ...cardForm,
      price: selectedPrice,
      id: editingIndex !== null ? cards[editingIndex].id : Date.now(),
      status: "unpaid",
      createdAt:
        editingIndex !== null
          ? cards[editingIndex].createdAt
          : new Date().toISOString(),
    };

    const nextCards =
      editingIndex !== null
        ? cards.map((card, index) =>
            index === editingIndex ? cardPayload : card,
          )
        : [...cards, cardPayload];

    try {
      const savedSubmission = await persistCards(nextCards, nextCards.length);
      if (savedSubmission?._id) {
        setCurrentSubmissionId(savedSubmission._id);
      }
      syncCardsFromSubmission(savedSubmission || { cards: nextCards });
      setEditingIndex(null);
      // Reset form but keep selectedPrice for convenience
      setCardForm({
        player: "",
        year: "",
        set: "",
        cardNumber: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving card:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to save card. Please try again.",
      }));
    }
  };

  const handleEditCard = (index) => {
    const card = cards[index];
    setCardForm({
      player: card.player,
      year: card.year,
      set: card.set,
      cardNumber: card.cardNumber,
      notes: card.notes || "",
    });
    setSelectedPrice(card.price);
    setEditingIndex(index);
    setErrors({});
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCardForm({
      player: "",
      year: "",
      set: "",
      cardNumber: "",
      notes: "",
    });
    setSelectedPrice(null);
    setErrors({});
  };

  const handleDeleteCard = async (index) => {
    const allCards = cards.map((card, i) =>
      i === index ? { ...card, isDeleted: true } : card,
    );
    const visibleCards = allCards.filter((card) => !card.isDeleted);

    try {
      const savedSubmission = await persistCards(allCards, visibleCards.length);
      if (savedSubmission?._id) {
        setCurrentSubmissionId(savedSubmission._id);
      }
      syncCardsFromSubmission(savedSubmission || { cards: visibleCards });
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const canContinue = useMemo(() => {
    return cards.length > 0;
  }, [cards.length]);

  const handleContinue = async () => {
    if (!canContinue) {
      setErrors((prev) => ({
        ...prev,
        submit: "Add at least one card before continuing",
      }));
      return;
    }

    let submissionIdToUse = currentSubmissionId;

    if (!submissionIdToUse) {
      try {
        const savedSubmission = await persistCards(cards, cards.length);
        if (savedSubmission?._id) {
          submissionIdToUse = savedSubmission._id;
          setCurrentSubmissionId(savedSubmission._id);
          syncCardsFromSubmission(savedSubmission);
        }
      } catch (error) {
        console.error("Error preparing submission for review:", error);
        setErrors((prev) => ({
          ...prev,
          submit: "Failed to prepare submission. Please try again.",
        }));
      }
    }

    if (submissionIdToUse) {
      navigate(`/submission-review/${submissionIdToUse}`);
      return;
    }

    // Legacy fallback: rely on cached data when submission isn't persisted yet
    sessionStorageManager.setSubmissionForm({
      cards,
      cardCount: cards.length,
      serviceTier,
    });

    navigate("/submission-review", {
      state: {
        cards,
        serviceTier,
        cardCount: cards.length,
      },
    });
  };

  const handleSaveAndExit = async () => {
    if (cards.length === 0) {
      navigate("/dashboard");
      return;
    }

    try {
      const savedSubmission = await persistCards(cards, cards.length);
      if (savedSubmission?._id) {
        setCurrentSubmissionId(savedSubmission._id);
      }
      syncCardsFromSubmission(savedSubmission || { cards });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving cards:", error);
      // Still navigate even if save fails
      navigate("/dashboard");
    }
  };

  const handlePriceSelect = (price) => {
    setSelectedPrice(price);
    setErrors((prev) => ({ ...prev, price: undefined, submit: undefined }));
    // Do NOT update existing cards - price applies only to current card being added/edited
  };

  if (loading) {
    return <StackedCardsLoader />;
  }

  return (
    <div className="ng-app-shell ng-app-shell--dark add-cards-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <h1 className="ng-page-title add-cards-page__title">ADD CARDS</h1>
          <div className="add-cards__container add-cards__container--split">
            <div className="add-cards__left">
              <Card className="add-cards__panel">
                <h2>{editingIndex !== null ? "EDIT CARD" : "ADD A CARD"}</h2>
                <div className="add-cards__form">
                  <Input
                    label="PLAYER"
                    placeholder="Player name"
                    value={cardForm.player}
                    onChange={(e) =>
                      handleFieldChange("player", e.target.value)
                    }
                    error={errors.player}
                    required={true}
                    onBlur={() => {
                      const playerErrors = {};
                      if (cardForm.player.length > 0) {
                        if (cardForm.player.length < 3) {
                          playerErrors.player =
                            "Minimum 3 characters required.";
                        } else if (!/^[a-zA-Z\s]+$/.test(cardForm.player)) {
                          playerErrors.player = "Only alphabets allowed.";
                        }
                        setErrors((prev) => ({ ...prev, ...playerErrors }));
                      }
                    }}
                  />
                  <Input
                    label="YEAR"
                    placeholder="2024"
                    value={cardForm.year}
                    onChange={(e) => handleFieldChange("year", e.target.value)}
                    error={errors.year}
                    required={true}
                    onBlur={() => {
                      const yearErrors = {};
                      if (cardForm.year.length > 0) {
                        if (!/^\d{4}$/.test(cardForm.year)) {
                          yearErrors.year = "Year must be exactly 4 digits.";
                        }
                        setErrors((prev) => ({ ...prev, ...yearErrors }));
                      }
                    }}
                  />
                  <Input
                    label="SET"
                    placeholder="Set name"
                    value={cardForm.set}
                    onChange={(e) => handleFieldChange("set", e.target.value)}
                    error={errors.set}
                    required={true}
                  />
                  <Input
                    label="CARD #"
                    placeholder="Card number"
                    value={cardForm.cardNumber}
                    onChange={(e) =>
                      handleFieldChange("cardNumber", e.target.value)
                    }
                    error={errors.cardNumber}
                    required={true}
                    onBlur={() => {
                      const cardErrors = {};
                      if (cardForm.cardNumber.length > 0) {
                        if (cardForm.cardNumber.length !== 6) {
                          cardErrors.cardNumber =
                            "Card ID must be exactly 6 characters.";
                        } else if (
                          !/^[a-zA-Z0-9]{6}$/.test(cardForm.cardNumber)
                        ) {
                          cardErrors.cardNumber =
                            "Only alphanumeric characters allowed.";
                        }
                        setErrors((prev) => ({ ...prev, ...cardErrors }));
                      }
                    }}
                  />
                  <Input
                    label="NOTES (OPTIONAL)"
                    placeholder="Notes"
                    value={cardForm.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                  />
                  <div className="add-cards__form-buttons">
                    <Button
                      variant="primary"
                      className="ng-button--block"
                      onClick={handleAddOrUpdate}
                    >
                      {editingIndex !== null ? "SAVE CHANGES" : "ADD CARD"}
                    </Button>
                    {editingIndex !== null && (
                      <Button
                        variant="secondary"
                        className="ng-button--block"
                        onClick={handleCancelEdit}
                      >
                        CANCEL
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="add-cards__right">
              <Card className="add-cards__list">
                <h2>ADDED CARDS</h2>
                {cards.length === 0 ? (
                  <p className="add-cards__empty">No cards added yet.</p>
                ) : (
                  <div className="add-cards__stack">
                    {cards.map((card, index) => (
                      <div className="add-cards__item" key={index}>
                        <div>
                          <p className="add-cards__item-title">{card.player}</p>
                          <p className="add-cards__item-meta">
                            {card.year} • {card.set} • #{card.cardNumber}
                          </p>
                          <p className="add-cards__item-price">
                            ${card.price} selected
                          </p>
                        </div>
                        <div className="add-cards__item-actions">
                          <button
                            type="button"
                            className="add-cards__action add-cards__action--primary"
                            onClick={() => handleEditCard(index)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="add-cards__action add-cards__action--danger"
                            onClick={() => handleDeleteCard(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="add-cards__pricing">
                <h2>CHOOSE YOUR PRICE</h2>
                <div className="add-cards__pricing-options">
                  {[5, 10, 20].map((price) => (
                    <button
                      key={price}
                      type="button"
                      className={`add-cards__price-option${
                        selectedPrice === price
                          ? " add-cards__price-option--active"
                          : ""
                      }`}
                      onClick={() => handlePriceSelect(price)}
                    >
                      ${price}
                    </button>
                  ))}
                </div>
                {errors.price && (
                  <p className="add-cards__error">{errors.price}</p>
                )}
                {errors.submit && !errors.price && (
                  <p className="add-cards__error">{errors.submit}</p>
                )}
              </Card>
            </div>

            <div className="add-cards__actions add-cards__actions--centered">
              <Button
                variant="secondary"
                onClick={handleSaveAndExit}
                className="add-cards__button"
              >
                SAVE AND EXIT
              </Button>
              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={!canContinue}
                className="add-cards__button"
              >
                CONTINUE TO REVIEW
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
