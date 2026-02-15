export const sessionStorageManager = {
  // Cache keys
  CACHE_KEYS: {
    USER: "user",
    SUBMISSIONS: "submissions",
    SUBMISSION_FORM: "submission_form",
    PRICING_TIERS: "pricing_tiers",
  },

  get(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from sessionStorage: ${key}`, error);
      return null;
    }
  },

  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to sessionStorage: ${key}`, error);
    }
  },

  remove(key) {
    sessionStorage.removeItem(key);
  },

  clear() {
    sessionStorage.clear();
  },

  // User cache
  getUser() {
    return this.get(this.CACHE_KEYS.USER);
  },

  setUser(user) {
    this.set(this.CACHE_KEYS.USER, user);
  },

  // Submissions cache
  getSubmissions() {
    return this.get(this.CACHE_KEYS.SUBMISSIONS);
  },

  setSubmissions(submissions) {
    this.set(this.CACHE_KEYS.SUBMISSIONS, submissions);
  },

  // Submission form cache (multi-step form state)
  getSubmissionForm() {
    return this.get(this.CACHE_KEYS.SUBMISSION_FORM);
  },

  setSubmissionForm(form) {
    this.set(this.CACHE_KEYS.SUBMISSION_FORM, form);
  },

  removeSubmissionForm() {
    this.remove(this.CACHE_KEYS.SUBMISSION_FORM);
  },

  // Pricing tiers cache
  getPricingTiers() {
    return this.get(this.CACHE_KEYS.PRICING_TIERS);
  },

  setPricingTiers(tiers) {
    this.set(this.CACHE_KEYS.PRICING_TIERS, tiers);
  },
};
