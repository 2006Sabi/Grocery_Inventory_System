const Product = require('../models/Product');
const Reorder = require('../models/Reorder');
const Invoice = require('../models/Invoice');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  const totalProducts = await Product.countDocuments({});
  const lowStockCount = await Product.countDocuments({
    $expr: { $lte: ['$stock', '$threshold'] }
  });

  const today = new Date();
  const expiredCount = await Product.countDocuments({
    expiryDate: { $lt: today }
  });

  const pendingReorders = await Reorder.countDocuments({ status: 'PENDING' });

  const salesSummary = await Invoice.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalAmount' },
        totalInvoices: { $sum: 1 },
      }
    }
  ]);

  const recentLogs = await InventoryLog.find({})
    .populate('productId', 'name')
    .sort('-createdAt')
    .limit(5);

  res.json({
    totalProducts,
    lowStockCount,
    expiredCount,
    pendingReorders,
    totalSalesAmount: salesSummary[0]?.totalSales || 0,
    totalInvoices: salesSummary[0]?.totalInvoices || 0,
    recentLogs,
  });
};

module.exports = { getDashboardStats };
