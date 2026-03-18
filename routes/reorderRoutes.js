const express = require('express');
const router = express.Router();
const { 
  getReorders, 
  getReorderById,
  createReorder, 
  updateReorder, 
  updateReorderStatus, 
  deleteReorder 
} = require('../controllers/reorderController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getReorders);
router.get('/:id', protect, getReorderById);
router.post('/', protect, createReorder);
router.put('/:id', protect, updateReorder);
router.put('/:id/status', protect, updateReorderStatus);
router.delete('/:id', protect, deleteReorder);

module.exports = router;
