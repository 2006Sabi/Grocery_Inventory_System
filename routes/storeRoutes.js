const express = require('express');
const router = express.Router();
const { getStore, updateStore } = require('../controllers/storeController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/:id', protect, getStore);
router.put('/:id', protect, admin, updateStore);

module.exports = router;
