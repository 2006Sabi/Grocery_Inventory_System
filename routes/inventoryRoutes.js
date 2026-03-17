const express = require('express');
const router = express.Router();
const InventoryLog = require('../models/InventoryLog');
const { protect } = require('../middlewares/authMiddleware');

const { updateStock } = require('../utils/stockHelper');

// @desc    Get inventory logs
// @route   GET /api/inventory/logs
// @access  Private
router.get('/logs', protect, async (req, res) => {
  const logs = await InventoryLog.find({})
    .populate('productId', 'name barcode')
    .sort('-createdAt')
    .limit(100);
  res.json(logs);
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
