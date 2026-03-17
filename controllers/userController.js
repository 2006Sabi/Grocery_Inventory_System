const User = require('../models/User');

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

module.exports = { createStaff, getStaff };
