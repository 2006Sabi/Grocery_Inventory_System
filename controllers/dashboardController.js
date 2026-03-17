const Product = require('../models/Product');
const Reorder = require('../models/Reorder');
const Invoice = require('../models/Invoice');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  console.log('--- ENTERING getDashboardStats ---');
  try {
    console.log('Step 1: Counting total products...');
    const totalProducts = await Product.countDocuments({});
    console.log('Total Products:', totalProducts);
    
    console.log('Step 2: Counting low stock products...');
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$threshold'] }
    });
    console.log('Low Stock Count:', lowStockCount);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log('Step 3: Counting expired products...');
    const expiredCount = await Product.countDocuments({
      expiryDate: { $lt: now }
    });
    console.log('Expired Count:', expiredCount);

    // Today's Sales
    let todaySalesVal = 0;
    try {
      console.log('Step 4: Aggregating today sales...');
      const todaySales = await Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      todaySalesVal = todaySales[0]?.total || 0;
      console.log('Today Sales:', todaySalesVal);
    } catch (e) {
      console.error('Error calculating today sales:', e.message);
    }

    // Monthly Sales
    let monthlySalesVal = 0;
    try {
      console.log('Step 5: Aggregating monthly sales...');
      const monthlySalesRes = await Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      monthlySalesVal = monthlySalesRes[0]?.total || 0;
      console.log('Monthly Sales:', monthlySalesVal);
    } catch (e) {
      console.error('Error calculating monthly sales:', e.message);
    }

    // Sales Data for last 7 days chart
    let salesData = [];
    try {
      console.log('Step 6: Aggregating weekly sales data...');
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const salesDataRaw = await Invoice.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' }, // Returns 1 (Sun) to 7 (Sat)
            sales: { $sum: '$totalAmount' }
          }
        }
      ]);

      const dayNames = [null, 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayOfWeek = d.getDay() + 1; // getDay() is 0-6, so +1 to match $dayOfWeek
        const dayName = dayNames[dayOfWeek];
        const dayData = salesDataRaw.find(s => s._id === dayOfWeek);
        salesData.push({ name: dayName, sales: dayData ? dayData.sales : 0 });
      }
      console.log('Sales Data Chart prepared');
    } catch (e) {
      console.error('Error calculating sales data chart:', e.message);
      salesData = [];
    }

    // Inventory Distribution by Category
    let inventoryData = [];
    try {
      console.log('Step 7: Aggregating inventory data...');
      inventoryData = await Product.aggregate([
        { $match: { categoryId: { $ne: null } } },
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$category.name', 'Uncategorized'] },
            value: '$count'
          }
        }
      ]);
      console.log('Inventory Data prepared');
    } catch (e) {
      console.error('Error calculating inventory data chart:', e.message);
      inventoryData = [];
    }

    console.log('--- COMPLETED getDashboardStats SUCCESS ---');
    res.json({
      totalProducts,
      lowStock: lowStockCount,
      expired: expiredCount,
      todaySales: todaySalesVal,
      monthlySales: monthlySalesVal,
      salesData,
      inventoryData
    });
  } catch (error) {
    console.error('CRITICAL Dashboard Stats Error:', error.message);
    res.status(500).json({ 
      message: error.message, 
      error: 'CRITICAL_DASHBOARD_ERROR',
      stack: error.stack 
    });
  }
};

module.exports = { getDashboardStats };
