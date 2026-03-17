const express = require('express');
const router = express.Router();
const InventoryLog = require('../models/InventoryLog');
const { protect } = require('../middlewares/authMiddleware');

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

module.exports = router;
