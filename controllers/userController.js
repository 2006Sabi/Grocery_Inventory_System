const User = require('../models/User');
const Store = require('../models/Store');
const sendEmail = require('../utils/sendEmail');

// @desc    Create a new staff user (ADMIN ONLY)
// @route   POST /api/users/create-staff
// @access  Private/Admin
const createStaff = async (req, res) => {
  const { name, email, password, permissions } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Use the admin's storeId for the new staff
  const staff = await User.create({
    name,
    email,
    password,
    role: 'STAFF',
    storeId: req.user.storeId,
    permissions: permissions || [],
  });

  if (staff) {
    // Send welcome email
    await sendEmail({
      email: staff.email,
      subject: 'Welcome to Inventory System',
      message: `Hello ${staff.name},

Your account has been created.

Login Details:
Email: ${staff.email}
Password: ${password} (For demo purposes)

You can now login and access the system based on your assigned permissions.`
    });

    res.status(201).json({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      storeId: staff.storeId,
    });
  } else {
    res.status(400).json({ message: 'Invalid staff data' });
  }
};

// @desc    Get all staff for the admin's store
// @route   GET /api/users/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
  const staff = await User.find({ storeId: req.user.storeId, role: 'STAFF' });
  res.json(staff);
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const store = await Store.findById(user.storeId);
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      profileImage: user.profileImage || '',
      storeName: store ? store.name : 'Unknown Store',
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : user.profileImage;

    const updatedUser = await user.save();
    const store = await Store.findById(updatedUser.storeId);

    res.json({
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || '',
      profileImage: updatedUser.profileImage || '',
      storeName: store ? store.name : 'Unknown Store',
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { createStaff, getStaff, getProfile, updateProfile };
