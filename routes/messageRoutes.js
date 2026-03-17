const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', protect, admin, sendMessage);
router.get('/', protect, getMessages);

module.exports = router;
