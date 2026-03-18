const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .populate('productId', 'name')
      .populate('sender', 'name role')
      .populate('createdBy', 'name role');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a notification manually
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { message, type, productName } = req.body;
    
    // Find all users (Admin + Staff) 
    const users = await User.find({ 
      storeId: req.user.storeId, 
      role: { $in: ['ADMIN', 'STAFF'] } 
    });
    const recipients = users.map(u => u._id);

    const notification = await Notification.create({
      message,
      type,
      productName,
      createdBy: req.user._id,
      recipients,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a notification
// @route   PUT /api/notifications/:id
// @access  Private
const updateNotification = async (req, res) => {
  try {
    const { message, type, productName } = req.body;
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      notification.message = message || notification.message;
      notification.type = type || notification.type;
      notification.productName = productName || notification.productName;
      
      const updatedNotification = await notification.save();
      res.json(updatedNotification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      await notification.deleteOne();
      res.json({ message: 'Notification removed' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      notification.isRead = true;
      const updatedNotification = await notification.save();
      res.json(updatedNotification);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a staff message (legacy/specialized, keeping for compatibility)
// @route   POST /api/notifications/message
// @access  Private
const sendStaffMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found in request' });
    }

    if (!message) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Find all users (Admin + Staff) 
    const users = await User.find({ 
      storeId: req.user.storeId, 
      role: { $in: ['ADMIN', 'STAFF'] } 
    });
    
    const recipients = users.map(u => u._id);

    const notification = await Notification.create({
      message,
      type: 'MESSAGE',
      sender: req.user._id,
      createdBy: req.user._id,
      recipients,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error in sendStaffMessage:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getNotifications, 
  createNotification, 
  updateNotification, 
  deleteNotification, 
  markAsRead, 
  sendStaffMessage 
};
