// Append these cases to your existing getStatusColor and getStatusDotColor in helper.js
// ─────────────────────────────────────────────────────────────────────────────
// These handle the period/structure badge variants used in the new pages.
// Merge them into your existing helper.js colors objects:

/*
  getStatusColor additions:
    QUARTERLY: 'bg-navy-light text-navy border-[#C7D7EE]',
    MONTHLY:   'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
    YEARLY:    'bg-success-light text-success border-success-mid',
    PENDING:   'bg-gray-100 text-gray-600 border-gray-200',
    CLOSED:    'bg-gray-100 text-gray-600 border-gray-200',

  getStatusDotColor additions:
    QUARTERLY: 'bg-navy',
    MONTHLY:   'bg-[#0369A1]',
    YEARLY:    'bg-success',
    PENDING:   'bg-gray-400',
    CLOSED:    'bg-gray-400',
*/

// Full updated helper.js:

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString || dateString === '-') return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    // payment statuses
    PAID:      'bg-success-light text-success border-success-mid',
    PARTIAL:   'bg-warning-light text-warning border-warning-mid',
    UNPAID:    'bg-danger-light text-danger border-danger-mid',
    OVERDUE:   'bg-danger-light text-danger border-danger-mid',
    // period types
    QUARTERLY: 'bg-navy-light text-navy border-[#C7D7EE]',
    MONTHLY:   'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
    YEARLY:    'bg-success-light text-success border-success-mid',
    // period statuses
    PENDING:   'bg-gray-100 text-gray-600 border-gray-200',
    CLOSED:    'bg-gray-100 text-gray-600 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
};

export const getStatusDotColor = (status) => {
  const colors = {
    PAID:      'bg-success',
    PARTIAL:   'bg-warning',
    UNPAID:    'bg-danger',
    OVERDUE:   'bg-danger',
    QUARTERLY: 'bg-navy',
    MONTHLY:   'bg-[#0369A1]',
    YEARLY:    'bg-success',
    PENDING:   'bg-gray-400',
    CLOSED:    'bg-gray-400',
  };
  return colors[status] || 'bg-gray-400';
};

export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};