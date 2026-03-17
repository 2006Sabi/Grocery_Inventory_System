const express = require('express');
const router = express.Router();
const { getReorders, createReorder } = require('../controllers/reorderController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/', protect, authorize('ADMIN'), getReorders);
router.post('/:productId', protect, createReorder);

module.exports = router;
