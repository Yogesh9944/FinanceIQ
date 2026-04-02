export const formatCurrency = (amount, currency = '₹') => {
  if (amount === undefined || amount === null) return `${currency}0`;
  const num = Math.abs(Number(amount));
  if (num >= 10000000) return `${currency}${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `${currency}${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `${currency}${(num / 1000).toFixed(1)}K`;
  return `${currency}${num.toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const getMonthName = (month) => {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month - 1];
};

export const getCategoryIcon = (category) => {
  const icons = {
    Food: '🍔', Rent: '🏠', Travel: '✈️', Bills: '⚡',
    Shopping: '🛍️', Healthcare: '💊', Entertainment: '🎬',
    Education: '📚', Salary: '💼', Freelance: '💻',
    Investment: '📈', Other: '📦',
  };
  return icons[category] || '💰';
};

export const getScoreLabel = (score) => {
  if (score >= 80) return { label: 'Excellent', color: '#22c55e' };
  if (score >= 60) return { label: 'Good', color: '#3b82f6' };
  if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
  return { label: 'Poor', color: '#ef4444' };
};
