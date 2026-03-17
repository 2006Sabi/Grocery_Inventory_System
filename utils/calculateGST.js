const calculateGST = (subtotal, gstRate) => {
  const gstAmount = (subtotal * gstRate) / 100;
  const totalAmount = subtotal + gstAmount;
  return { gstAmount: Number(gstAmount.toFixed(2)), totalAmount: Number(totalAmount.toFixed(2)) };
};

module.exports = calculateGST;
