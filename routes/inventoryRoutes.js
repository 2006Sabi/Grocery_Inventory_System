const express = require('express');
const router = express.Router();
const InventoryLog = require('../models/InventoryLog');
const { protect } = require('../middlewares/authMiddleware');

const { updateStock } = require('../utils/stockHelper');

// @desc    Get inventory logs
// @route   GET /api/inventory/logs
// @access  Private
router.get('/logs', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.search) {
      filter.productName = { $regex: req.query.search, $options: 'i' };
    }

    const total = await InventoryLog.countDocuments(filter);
    const logs = await InventoryLog.find(filter)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logs for specific product
// @route   GET /api/inventory/logs/:productId
// @access  Private
router.get('/logs/:productId', protect, async (req, res) => {
  try {
    const logs = await InventoryLog.find({ productId: req.params.productId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update stock manually
// @route   POST /api/inventory/update/:productId
// @access  Private
router.post('/update/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await updateStock(req.params.productId, quantity, 'ADJUSTMENT');
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
