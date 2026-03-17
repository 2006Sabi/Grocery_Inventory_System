const getExpiryPriority = (expiryDate) => {
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 3) return 'HIGH';
  if (diffDays <= 7) return 'MEDIUM';
  return 'LOW';
};

module.exports = { getExpiryPriority };
