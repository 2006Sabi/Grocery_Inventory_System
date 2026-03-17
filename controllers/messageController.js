const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message to all staff (ADMIN ONLY)
// @route   POST /api/messages
// @access  Private/Admin
const sendMessage = async (req, res) => {
  const { message } = req.body;

  try {
    const staffMembers = await User.find({ storeId: req.user.storeId, role: 'STAFF' }).select('_id');
    const recipients = staffMembers.map(staff => staff._id);

    const newMessage = await Message.create({
      sender: req.user._id,
      message,
      recipients,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for logged in user
// @route   GET /api/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    let messages;
    if (req.user.role === 'ADMIN') {
      messages = await Message.find({ sender: req.user._id }).sort({ createdAt: -1 });
    } else {
      messages = await Message.find({ recipients: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages };
