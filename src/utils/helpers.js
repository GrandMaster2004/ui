export const calculatePricing = (cardCount, serviceTier) => {
  const tierPrices = {
    SPEED_DEMON: 289,
    THE_STANDARD: 49,
    BIG_MONEY: 69,
  };

  const basePrice = tierPrices[serviceTier] || 0;
  const processingFee = Math.round(basePrice * 0.05 * 100) / 100;
  const total = basePrice + processingFee;

  return {
    basePrice,
    processingFee,
    total: Math.round(total * 100) / 100,
  };
};

export const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusLabel = (status) => {
  const labels = {
    Created: "📦 Created",
    "Awaiting Shipment": "📤 Awaiting Shipment",
    Received: "📬 Received",
    "In Grading": "🔍 In Grading",
    "Ready for Payment": "💳 Ready for Payment",
    Shipped: "🚚 Shipped",
    Completed: "✓ Completed",
  };
  return labels[status] || status;
};
