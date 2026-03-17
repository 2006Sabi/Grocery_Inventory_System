const Reorder = require('../models/Reorder');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get all reorders
// @route   GET /api/reorders
// @access  Private/Admin
const getReorders = async (req, res) => {
  const reorders = await Reorder.find({}).populate('productId', 'name').populate('supplierId', 'name');
  res.json(reorders);
};

// @desc    Create auto reorder request
// @route   POST /api/reorders/:productId
// @access  Private
const createReorder = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Calculate avgDailySales
  // We'll look at SALE logs for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const salesLogs = await InventoryLog.find({
    productId: product._id,
    action: 'SALE',
    date: { $gte: thirtyDaysAgo }
  });

  const totalSales = salesLogs.reduce((acc, log) => acc + log.quantity, 0);
  const avgDailySales = totalSales / 30 || 1; // Default to 1 if no sales or very low sales
  const suggestedQuantity = Math.ceil(avgDailySales * 7); // 1 week stock

  const reorder = await Reorder.create({
    productId: product._id,
    supplierId: product.supplierId,
    suggestedQuantity,
    status: 'PENDING',
  });

  res.status(201).json(reorder);
};

module.exports = { getReorders, createReorder };
