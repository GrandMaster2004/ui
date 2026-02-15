import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import ReactDOM from "react-dom";
import { Button, Card, Select, LoadingSkeleton } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";
import { useAdmin } from "../hooks/useAdmin.js";

// Dropdown context to ensure only one dropdown is open at a time
const DropdownContext = createContext();

const useDropdownManager = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdownManager must be used within DropdownProvider");
  }
  return context;
};

const DropdownProvider = ({ children }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const openDropdown_func = useCallback((id) => {
    setOpenDropdown(id);
  }, []);

  return (
    <DropdownContext.Provider
      value={{
        openDropdown,
        setOpenDropdown,
        openDropdown_func,
        closeAllDropdowns,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

const AdminFilterDropdown = ({ options, value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { openDropdown, setOpenDropdown, closeAllDropdowns } =
    useDropdownManager();
  const dropdownId = "filter-dropdown";

  const selectedOption = options.find((opt) => opt.value === value);
  const isThisOpen = openDropdown === dropdownId;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    if (isThisOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isThisOpen, setOpenDropdown]);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setOpenDropdown(null);
  };

  const handleToggle = () => {
    if (isThisOpen) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownId);
    }
  };

  return (
    <div ref={dropdownRef} className={`admin-filter-dropdown ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="admin-filter-dropdown__button"
        aria-expanded={isThisOpen}
      >
        <span className="admin-filter-dropdown__label">
          {selectedOption?.label || "Select..."}
        </span>
        <span
          className={`admin-filter-dropdown__arrow ${isThisOpen ? "admin-filter-dropdown__arrow--open" : ""}`}
        >
          ▼
        </span>
      </button>

      {isThisOpen && (
        <div className="admin-filter-dropdown__menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`admin-filter-dropdown__item ${
                value === opt.value
                  ? "admin-filter-dropdown__item--selected"
                  : ""
              }`}
            >
              <span className="admin-filter-dropdown__item-text">
                {opt.label}
              </span>
              {value === opt.value && (
                <span className="admin-filter-dropdown__item-checkmark">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusSelectDropdown = ({
  value,
  onChange,
  disabled,
  options = [],
  id,
  onOpenChange,
  sectionRef,
}) => {
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const { openDropdown, setOpenDropdown } = useDropdownManager();
  const isThisOpen = openDropdown === id;
  const [menuStyle, setMenuStyle] = useState({});

  const selectedOption = options.find((opt) => opt.value === value);

  // Calculate fixed position once when menu opens
  useEffect(() => {
    if (isThisOpen && dropdownRef.current) {
      const buttonEl = dropdownRef.current.querySelector(
        ".admin-status-dropdown__button",
      );
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < 260 && rect.top > 260;

        setMenuStyle({
          position: "fixed",
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          ...(openUp
            ? { bottom: `${window.innerHeight - rect.top + 4}px` }
            : { top: `${rect.bottom + 4}px` }),
        });
      }
    }
  }, [isThisOpen]);

  // Close on any scroll or resize (instead of trying to track position)
  useEffect(() => {
    if (!isThisOpen) return;

    const close = () => {
      setOpenDropdown(null);
      onOpenChange?.(false);
    };

    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isThisOpen, setOpenDropdown, onOpenChange]);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setOpenDropdown(null);
    onOpenChange?.(false);
  };

  const handleToggle = () => {
    if (isThisOpen) {
      setOpenDropdown(null);
      onOpenChange?.(false);
    } else {
      setOpenDropdown(id);
      onOpenChange?.(true);
    }
  };

  // Click outside handler - checks both trigger and portal menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
        onOpenChange?.(false);
      }
    };

    if (isThisOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isThisOpen, onOpenChange, setOpenDropdown]);

  return (
    <div
      ref={dropdownRef}
      className={`admin-status-dropdown ${
        disabled ? "admin-status-dropdown--disabled" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => !disabled && handleToggle()}
        className="admin-status-dropdown__button"
        aria-expanded={isThisOpen}
        disabled={disabled}
        title={disabled ? "Updating..." : "Click to change submission status"}
      >
        <span className="admin-status-dropdown__label">
          {selectedOption?.label || "Select..."}
        </span>
        <span
          className={`admin-status-dropdown__arrow ${isThisOpen ? "admin-status-dropdown__arrow--open" : ""}`}
        >
          ▼
        </span>
      </button>

      {isThisOpen &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="admin-status-dropdown__menu"
            style={menuStyle}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`admin-status-dropdown__item ${
                  value === opt.value
                    ? "admin-status-dropdown__item--selected"
                    : ""
                }`}
              >
                <span className="admin-status-dropdown__item-text">
                  {opt.label}
                </span>
                {value === opt.value && (
                  <span className="admin-status-dropdown__item-checkmark">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};

const SubmissionRow = ({
  submission,
  onStatusChange,
  isUpdating,
  sectionRef,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const statusSlug = (value) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "unknown";

  const getStatusClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  const getPaymentClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  return (
    <tr
      className={`ng-table__row ${isDropdownOpen ? "ng-table__row--dropdown-open" : ""}`}
    >
      <td className="ng-table__cell">
        <div className="admin-cell-content">
          <div className="admin-customer-name">
            {submission.userId?.name || "Unknown"}
          </div>
          <div className="admin-customer-email">
            {submission.userId?.email || "N/A"}
          </div>
        </div>
      </td>
      <td className="ng-table__cell">{submission._id.slice(0, 8)}</td>
      <td className="ng-table__cell">
        {new Date(submission.createdAt).toLocaleDateString()}
      </td>
      <td className="ng-table__cell ng-table__cell--strong">
        {submission.numberOfCards}
      </td>
      <td className="ng-table__cell">
        <StatusSelectDropdown
          id={`status-dropdown-${submission._id}`}
          value={submission.submissionStatus}
          onChange={(e) => onStatusChange(submission._id, e.target.value)}
          disabled={isUpdating}
          onOpenChange={setIsDropdownOpen}
          sectionRef={sectionRef}
          options={[
            { value: "submitted", label: "Submitted" },
            { value: "in_review", label: "In Review" },
            { value: "grading", label: "Grading" },
            { value: "completed", label: "Completed" },
            { value: "shipped", label: "Shipped" },
          ]}
        />
        {isUpdating && <span className="admin-updating">Saving...</span>}
      </td>
      <td className="ng-table__cell">
        <span className={getPaymentClass(submission.paymentStatus)}>
          {submission.paymentStatus === "unpaid"
            ? "Unpaid"
            : submission.paymentStatus === "paid"
              ? "Paid"
              : "Failed"}
        </span>
      </td>
      <td className="ng-table__cell ng-table__cell--numeric">
        ${submission.amount.toFixed(2)}
      </td>
    </tr>
  );
};

export const AdminPage = ({ user, onLogout }) => {
  const {
    submissions,
    analytics,
    loading,
    error,
    pagination,
    fetchSubmissions,
    updateSubmissionStatus,
    fetchAnalytics,
  } = useAdmin();

  const [universalSearch, setUniversalSearch] = useState("");
  const [unifiedFilter, setUnifiedFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const submissionsSectionRef = useRef(null);

  // Fetch submissions and analytics on mount only
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchSubmissions(1, null);
        await fetchAnalytics();
      } catch (err) {
        console.error("Failed to load admin data:", err);
      }
    };

    loadInitialData();
  }, []);

  const memoizedSubmissions = useMemo(() => {
    let filtered = submissions || [];

    // Filter by universal search (customer name, email, or submission ID)
    if (universalSearch.trim()) {
      const searchLower = universalSearch.toLowerCase();
      filtered = filtered.filter((submission) => {
        const name = submission.userId?.name?.toLowerCase() || "";
        const email = submission.userId?.email?.toLowerCase() || "";
        const id = submission._id.toLowerCase();
        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          id.includes(searchLower)
        );
      });
    }

    // Parse unified filter to determine if it's a status or date filter
    const statusValues = [
      "submitted",
      "in_review",
      "grading",
      "completed",
      "shipped",
    ];
    const dateValues = ["newest", "oldest", "last7days", "last30days"];

    // Filter by status (if selected and is a status filter)
    if (unifiedFilter && statusValues.includes(unifiedFilter)) {
      filtered = filtered.filter(
        (submission) => submission.submissionStatus === unifiedFilter,
      );
    }

    // Filter by specific date (if selected)
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      const selectedDateStr = selectedDateObj.toLocaleDateString();
      filtered = filtered.filter((submission) => {
        const submissionDateStr = new Date(
          submission.createdAt,
        ).toLocaleDateString();
        return submissionDateStr === selectedDateStr;
      });
    }

    // Apply date filter type (sorting/date range) if selected from unified dropdown
    if (unifiedFilter && dateValues.includes(unifiedFilter)) {
      if (unifiedFilter === "newest") {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (unifiedFilter === "oldest") {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (unifiedFilter === "last7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter(
          (submission) => new Date(submission.createdAt) >= sevenDaysAgo,
        );
      } else if (unifiedFilter === "last30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(
          (submission) => new Date(submission.createdAt) >= thirtyDaysAgo,
        );
      }
    }

    return filtered;
  }, [submissions, universalSearch, unifiedFilter, selectedDate]);

  const handleStatusChange = useCallback(
    async (submissionId, newStatus) => {
      setUpdatingId(submissionId);
      setUpdateError(null);

      try {
        await updateSubmissionStatus(submissionId, newStatus);
      } catch (error) {
        const errorMsg =
          error.message || "Failed to update status. Please try again.";
        setUpdateError(errorMsg);
        console.error("Error updating status:", error);
        // Clear error after 5 seconds
        setTimeout(() => setUpdateError(null), 5000);
      } finally {
        setUpdatingId(null);
      }
    },
    [updateSubmissionStatus],
  );

  return (
    <DropdownProvider>
      <div className="ng-app-shell ng-app-shell--dark admin-page">
        <Header user={user} onLogout={onLogout} />
        <Container>
          <div className="ng-section">
            <h1 className="ng-page-title">ADMIN VAULT</h1>

            {/* Error Alert */}
            {(error || updateError) && (
              <div className="admin-error-alert">
                <span className="admin-error-icon">⚠️</span>
                <div className="admin-error-message">
                  <p className="admin-error-text">{updateError || error}</p>
                </div>
              </div>
            )}

            {/* Analytics Section */}
            {analytics && (
              <div className="admin-analytics">
                <Card>
                  <p className="admin-analytics__label">Total Submissions</p>
                  <p className="admin-analytics__value">
                    {analytics.totalSubmissions}
                  </p>
                </Card>
                <Card>
                  <p className="admin-analytics__label">Processing Queue</p>
                  <p className="admin-analytics__value">
                    {analytics.inGradingCount}
                  </p>
                </Card>
                <Card>
                  <p className="admin-analytics__label">Paid Revenue</p>
                  <p className="admin-analytics__value">
                    ${analytics.paidRevenue.toFixed(2)}
                  </p>
                </Card>
                {/* <Card>
                <p className="admin-analytics__label">Unpaid Revenue</p>
                <p className="admin-analytics__value">
                  ${analytics.unpaidRevenue.toFixed(2)}
                </p>
              </Card> */}
                <Card className="admin-analytics__highlight">
                  <p className="admin-analytics__label">Total Revenue</p>
                  <p className="admin-analytics__value">
                    ${analytics.totalRevenue.toFixed(2)}
                  </p>
                </Card>
              </div>
            )}

            {/* Main Submissions Table */}
            <Card className="admin-panel">
              <div ref={submissionsSectionRef} className="admin-panel__content">
                <div className="admin-panel__header">
                  <h2>ALL SUBMISSIONS - PAID & FINALIZED</h2>
                </div>

                {/* Unified Filter Row */}
                <div className="admin-unified-filters">
                  <input
                    type="text"
                    placeholder="Search by Customer Name, Email, or Submission ID"
                    value={universalSearch}
                    onChange={(e) => setUniversalSearch(e.target.value)}
                    className="admin-search-universal"
                    title="Search submissions by customer or ID"
                  />

                  <AdminFilterDropdown
                    options={[
                      { value: "", label: "All Filters" },
                      {
                        value: "submitted",
                        label: "Status: Submitted",
                      },
                      {
                        value: "in_review",
                        label: "Status: In Review",
                      },
                      {
                        value: "grading",
                        label: "Status: Grading",
                      },
                      {
                        value: "completed",
                        label: "Status: Completed",
                      },
                      {
                        value: "shipped",
                        label: "Status: Shipped",
                      },
                      {
                        value: "newest",
                        label: "Date: Newest First",
                      },
                      {
                        value: "oldest",
                        label: "Date: Oldest First",
                      },
                      {
                        value: "last7days",
                        label: "Date: Last 7 Days",
                      },
                      {
                        value: "last30days",
                        label: "Date: Last 30 Days",
                      },
                    ]}
                    value={unifiedFilter}
                    onChange={(e) => setUnifiedFilter(e.target.value)}
                    className="admin-filter-unified"
                  />

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="admin-date-input"
                    title="Filter by specific date"
                  />
                </div>

                {loading ? (
                  <LoadingSkeleton lines={5} />
                ) : memoizedSubmissions.length === 0 ? (
                  <div className="admin-empty-state">
                    <p>No submissions found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="ng-table-wrapper">
                      <table className="ng-table">
                        <thead>
                          <tr>
                            <th>CUSTOMER</th>
                            <th>ID</th>
                            <th>DATE</th>
                            <th>CARDS</th>
                            <th>SUBMISSION STATUS</th>
                            <th>PAYMENT</th>
                            <th className="ng-table__cell--numeric">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memoizedSubmissions.map((submission) => (
                            <SubmissionRow
                              key={submission._id}
                              submission={submission}
                              onStatusChange={handleStatusChange}
                              isUpdating={updatingId === submission._id}
                              sectionRef={submissionsSectionRef}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="admin-pagination">
                      <p>
                        Page {pagination.page} of {pagination.totalPages} (
                        {pagination.total} total)
                      </p>
                      <div className="admin-pagination__actions">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            fetchSubmissions(
                              Math.max(1, pagination.page - 1),
                              statusFilter,
                            )
                          }
                          disabled={pagination.page === 1}
                          className="admin-pagination__button"
                        >
                          ← PREV
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            fetchSubmissions(pagination.page + 1, statusFilter)
                          }
                          disabled={pagination.page === pagination.totalPages}
                          className="admin-pagination__button"
                        >
                          NEXT →
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </Container>
        <LandingFooter />
      </div>
    </DropdownProvider>
  );
};
