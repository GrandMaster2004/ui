import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, LoadingSkeleton } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";
import { useSubmissions } from "../hooks/useSubmissions.js";

const StatusBadge = ({ value, tone = "status" }) => {
  const slug = value ? value.toLowerCase().replace(/\s+/g, "-") : "unknown";
  const toneClass = tone === "payment" ? "status-badge--payment" : "";

  return (
    <span className={`status-badge ${toneClass} status-badge--${slug}`}>
      {value}
    </span>
  );
};

const DashboardSummary = ({ summary, paymentSummary }) => {
  return (
    <Card className="dashboard-summary">
      <h2>CUSTOMER OVERVIEW</h2>
      <div className="dashboard-summary__grid">
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">TOTAL SUBMISSIONS</span>
          <strong className="dashboard-summary__value">
            {summary.totalSubmissions}
          </strong>
        </div>
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">COMPLETED</span>
          <strong className="dashboard-summary__value">
            {summary.completedSubmissions}
          </strong>
        </div>
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">UNPAID CARDS</span>
          <strong className="dashboard-summary__value">
            {summary.unpaidCards}
          </strong>
        </div>
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">UNPAID AMOUNT</span>
          <strong className="dashboard-summary__value">
            ${summary.unpaidAmount.toFixed(2)}
          </strong>
        </div>
      </div>
      <div className="dashboard-summary__payments">
        <div>
          <span className="dashboard-summary__label">PAYMENT STATUS</span>
          <StatusBadge value={summary.paymentStatus} tone="payment" />
        </div>
        <div className="dashboard-summary__amounts">
          <div>
            <span>TOTAL</span>
            <strong>${paymentSummary.total.toFixed(2)}</strong>
          </div>
          <div>
            <span>PAID</span>
            <strong>${paymentSummary.paid.toFixed(2)}</strong>
          </div>
          <div>
            <span>REMAINING</span>
            <strong>${paymentSummary.remaining.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Memoized table row component
const SubmissionRow = ({ submission, navigate }) => {
  const statusSlug = (value) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "unknown";

  const getStatusClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  const paymentStatus =
    submission.paymentStatus === "paid"
      ? "Paid"
      : submission.paymentStatus === "failed"
        ? "Failed"
        : "Pending";

  // Map new status values to display text
  const statusMap = {
    draft: "Draft",
    submitted: "Submitted",
    in_review: "In Review",
    grading: "Grading",
    completed: "Completed",
    shipped: "Shipped",
  };

  const submissionStatus = statusMap[submission.submissionStatus] || "Unknown";

  const handleRowClick = () => {
    navigate(`/submission-review/${submission._id}`, {
      state: { fromVault: true },
    });
  };

  return (
    <tr
      className="ng-table__row ng-table__row--clickable"
      onClick={handleRowClick}
    >
      <td className="ng-table__cell">{submission._id.slice(0, 8)}</td>
      <td className="ng-table__cell">
        {new Date(submission.createdAt).toLocaleDateString()}
      </td>
      <td className="ng-table__cell ng-table__cell--strong">
        {submission.cardCount}
      </td>
      <td className="ng-table__cell">
        <span className={getStatusClass(paymentStatus)}>{paymentStatus}</span>
      </td>
      <td className="ng-table__cell">
        <span className={getStatusClass(submissionStatus)}>
          {submissionStatus}
        </span>
      </td>
    </tr>
  );
};

// Custom Dropdown Component for Status Filter
const StatusFilterDropdown = ({ selectedStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "submitted", label: "Submitted" },
    { value: "in_review", label: "In Review" },
    { value: "grading", label: "Grading" },
    { value: "completed", label: "Completed" },
    { value: "shipped", label: "Shipped" },
  ];

  const selectedLabel =
    filterOptions.find((opt) => opt.value === selectedStatus)?.label || "All";

  const handleSelect = (value) => {
    onStatusChange(value);
    setIsOpen(false);
  };

  return (
    <div className="vault-filter-dropdown">
      <button
        className="vault-filter-dropdown__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Filter by status"
      >
        <span className="vault-filter-dropdown__label">{selectedLabel}</span>
        <span
          className={`vault-filter-dropdown__arrow ${
            isOpen ? "vault-filter-dropdown__arrow--open" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="vault-filter-dropdown__menu">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`vault-filter-dropdown__item ${
                selectedStatus === option.value
                  ? "vault-filter-dropdown__item--selected"
                  : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              <span className="vault-filter-dropdown__item-text">
                {option.label}
              </span>
              {selectedStatus === option.value && (
                <span className="vault-filter-dropdown__item-checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const DashboardPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const {
    submissions,
    loading,
    fetchVaultSubmissions,
    fetchPaidSubmissions,
    fetchDashboardMetrics,
  } = useSubmissions();
  const [paidSubmissions, setPaidSubmissions] = useState(null);
  const [loadingPaid, setLoadingPaid] = useState(true);
  const [paidError, setPaidError] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const hasMountedRef = useRef(false);

  // Fetch both vault and paid submissions on component mount (once only)
  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    const loadVaultData = async () => {
      try {
        // Fetch unpaid submissions for Your Vault
        await fetchVaultSubmissions();
      } catch (err) {
        console.error("Failed to fetch vault submissions:", err);
      }

      // Fetch paid submissions for All Submissions
      setLoadingPaid(true);
      setPaidError(null);
      try {
        const paid = await fetchPaidSubmissions();
        setPaidSubmissions(paid || []);
      } catch (err) {
        console.error("Failed to fetch paid submissions:", err);
        setPaidError(err.message);
        setPaidSubmissions([]);
      } finally {
        setLoadingPaid(false);
      }

      // Fetch dashboard metrics from backend
      setLoadingMetrics(true);
      try {
        const metrics = await fetchDashboardMetrics();
        setDashboardMetrics(metrics);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics:", err);
        setDashboardMetrics(null);
      } finally {
        setLoadingMetrics(false);
      }
    };

    loadVaultData();
  }, []); // Only run once on mount

  const memoizedSubmissions = useMemo(() => {
    return submissions || [];
  }, [submissions]);

  const memoizedPaidSubmissions = useMemo(() => {
    return paidSubmissions || [];
  }, [paidSubmissions]);

  const submissionSummary = useMemo(() => {
    // Use backend-calculated metrics
    if (!dashboardMetrics) {
      return {
        totalSubmissions: 0,
        completedSubmissions: 0,
        paymentStatus: "Unpaid",
        unpaidCards: 0,
        unpaidAmount: 0,
      };
    }

    const { totalSubmissions, completedCards, unpaidCards, unpaidAmount } =
      dashboardMetrics;

    // Calculate total amount for payment status
    const totalAmount = memoizedSubmissions.reduce(
      (sum, submission) =>
        sum +
        (submission.cards || []).reduce(
          (cardSum, card) => cardSum + (card.price || 0),
          0,
        ),
      0,
    );

    const paymentStatus =
      totalSubmissions === 0
        ? "Unpaid"
        : unpaidAmount === 0
          ? "Paid"
          : unpaidAmount === totalAmount
            ? "Unpaid"
            : "Partially Paid";

    return {
      totalSubmissions,
      completedSubmissions: completedCards, // Backend provides completedCards count
      paymentStatus,
      unpaidCards,
      unpaidAmount,
    };
  }, [dashboardMetrics, memoizedSubmissions]);

  const paymentSummary = useMemo(() => {
    const total = memoizedSubmissions.reduce(
      (sum, submission) =>
        sum +
        (submission.cards || []).reduce(
          (cardSum, card) => cardSum + (card.price || 0),
          0,
        ),
      0,
    );
    const paid = memoizedSubmissions.reduce((sum, submission) => {
      if (submission.paymentStatus === "paid") {
        return (
          sum +
          (submission.cards || []).reduce(
            (cardSum, card) => cardSum + (card.price || 0),
            0,
          )
        );
      }
      return sum;
    }, 0);

    return {
      total,
      paid,
      remaining: Math.max(total - paid, 0),
    };
  }, [memoizedSubmissions]);

  const unpaidCards = useMemo(() => {
    const cards = [];
    memoizedSubmissions.forEach((submission) => {
      if (submission.paymentStatus !== "paid" && submission.cards) {
        submission.cards.forEach((card) => {
          // Only include unpaid cards that are NOT deleted
          if ((!card.status || card.status === "unpaid") && !card.isDeleted) {
            cards.push({
              cardNumber: card.cardNumber,
              player: card.player,
              year: card.year,
              set: card.set,
              notes: card.notes,
              price: card.price || 0,
            });
          }
        });
      }
    });
    return cards;
  }, [memoizedSubmissions]);

  const filteredSubmissions = useMemo(() => {
    let result = [...memoizedPaidSubmissions];

    // Apply search filter (submission ID or customer name)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((submission) => {
        const submissionId = submission._id.slice(0, 8).toLowerCase();
        const customerName = (submission.userId?.name || "").toLowerCase();
        return submissionId.includes(query) || customerName.includes(query);
      });
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      result = result.filter(
        (submission) => submission.submissionStatus === selectedStatus,
      );
    }

    // Apply date picker filter
    if (selectedDate) {
      const [year, month, day] = selectedDate.split("-");
      const filterDateStr = `${year}-${month}-${day}`;
      result = result.filter((submission) => {
        const submissionDateStr = new Date(submission.createdAt)
          .toISOString()
          .split("T")[0];
        return submissionDateStr === filterDateStr;
      });
    }

    return result;
  }, [memoizedPaidSubmissions, searchQuery, selectedStatus, selectedDate]);

  return (
    <div className="ng-app-shell ng-app-shell--dark dashboard-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <div className="page-header">
            <h1 className="ng-page-title">YOUR VAULT</h1>
            <Button variant="primary" onClick={() => navigate("/add-cards")}>
              START NEW SUBMISSION
            </Button>
          </div>

          <div className="dashboard-layout">
            <div className="dashboard-main">
              {loading ? (
                <LoadingSkeleton lines={6} />
              ) : (
                <>
                  <DashboardSummary
                    summary={submissionSummary}
                    paymentSummary={paymentSummary}
                  />

                  <Card className="dashboard-panel">
                    <h2>ALL SUBMISSIONS</h2>
                    <div className="ng-table-wrapper">
                      <table className="ng-table">
                        <thead>
                          <tr>
                            <th>SUBMISSION ID</th>
                            <th>SUBMISSION DATE</th>
                            <th>NUM OF CARDS</th>
                            <th>PAY STATUS</th>
                            <th>SUBMISSION STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingPaid ? (
                            <tr className="ng-table__row">
                              <td className="ng-table__cell" colSpan={5}>
                                Loading submissions...
                              </td>
                            </tr>
                          ) : filteredSubmissions.length === 0 ? (
                            <tr className="ng-table__row">
                              <td className="ng-table__cell" colSpan={5}>
                                {memoizedPaidSubmissions.length === 0
                                  ? "No completed submissions yet."
                                  : "No submissions match your filters."}
                              </td>
                            </tr>
                          ) : (
                            filteredSubmissions.map((submission) => (
                              <SubmissionRow
                                key={submission._id}
                                submission={submission}
                                navigate={navigate}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </div>

            <aside className="dashboard-panel--aside">
              <Card className="dashboard-action-panel">
                <h2>ACTIONS</h2>
                <p className="dashboard-action-panel__copy">
                  Manage your submissions or start a new grading order.
                </p>
                <Button
                  variant="primary"
                  className="ng-button--block"
                  onClick={() => navigate("/add-cards")}
                >
                  START NEW SUBMISSION
                </Button>
                <Button
                  variant="secondary"
                  className="ng-button--block"
                  onClick={() => navigate("/payment")}
                  disabled={
                    unpaidCards.length === 0 ||
                    submissionSummary.unpaidAmount <= 0
                  }
                >
                  PAYMENT OPTIONS
                </Button>
              </Card>

              {unpaidCards.length > 0 && (
                <Card className="dashboard-action-panel">
                  <h2>⚡ UNPAID CARDS</h2>
                  <p
                    className="dashboard-action-panel__copy"
                    style={{ marginBottom: "1rem" }}
                  >
                    {unpaidCards.length} card{unpaidCards.length > 1 ? "s" : ""}{" "}
                    awaiting payment
                  </p>
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <table
                      className="ng-table"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <thead>
                        <tr>
                          <th style={{ padding: "0.5rem" }}>PLAYER</th>
                          <th style={{ padding: "0.5rem" }}>YEAR</th>
                          <th style={{ padding: "0.5rem" }}>PRICE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unpaidCards.map((card, index) => (
                          <tr key={index} className="ng-table__row">
                            <td
                              className="ng-table__cell"
                              style={{ padding: "0.5rem" }}
                            >
                              {card.player}
                            </td>
                            <td
                              className="ng-table__cell"
                              style={{ padding: "0.5rem" }}
                            >
                              {card.year}
                            </td>
                            <td
                              className="ng-table__cell"
                              style={{ padding: "0.5rem" }}
                            >
                              ${card.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              <Card className="dashboard-action-panel">
                <h2>FILTER SUBMISSIONS</h2>
                <p className="dashboard-action-panel__copy">
                  Filter the submissions table below.
                </p>

                <div className="vault-filter-panel">
                  <div className="vault-filter-section">
                    <input
                      type="text"
                      className="vault-filter-input"
                      placeholder="Search by Submission ID or Customer Name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="vault-filter-section">
                    <label className="vault-filter-label">
                      Filter by Status
                    </label>
                    <StatusFilterDropdown
                      selectedStatus={selectedStatus}
                      onStatusChange={setSelectedStatus}
                    />
                  </div>

                  <div className="vault-filter-section">
                    <label className="vault-filter-label">Filter by Date</label>
                    <input
                      type="date"
                      className="vault-filter-date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
