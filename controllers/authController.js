const User = require('../models/User');
const Store = require('../models/Store');
const generateToken = require('../utils/generateToken');
const mongoose = require('mongoose');

// @desc    Register a new user (ADMIN & Store Owner)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, phone, password, storeName } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const userId = new mongoose.Types.ObjectId();
  const storeId = new mongoose.Types.ObjectId();

  try {
    const store = await Store.create({
      _id: storeId,
      name: storeName,
      ownerId: userId,
    });

    const user = await User.create({
      _id: userId,
      name,
      email,
      phone: phone || '',
      password,
      role: 'ADMIN',
      storeId: storeId.toString(),
    });

    if (user && store) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        storeId: user.storeId,
        storeName: store.name,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user or store data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Also fetch store name
    const store = await Store.findById(user.storeId);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      storeId: user.storeId,
      storeName: store ? store.name : 'Unknown Store',
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const store = await Store.findById(updatedUser.storeId);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      role: updatedUser.role,
      storeId: updatedUser.storeId,
      storeName: store ? store.name : 'Unknown Store',
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const store = await Store.findById(user.storeId);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      storeId: user.storeId,
      storeName: store ? store.name : 'Unknown Store',
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };
