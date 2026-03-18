const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  createNotification, 
  updateNotification, 
  deleteNotification, 
  markAsRead, 
  sendStaffMessage 
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);
router.post('/message', protect, sendStaffMessage);
router.put('/:id', protect, updateNotification);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
