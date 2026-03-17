const User = require('../models/User');
const Store = require('../models/Store');
const generateToken = require('../utils/generateToken');
const mongoose = require('mongoose');

// @desc    Register a new user (ADMIN & Store Owner)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, storeName } = req.body;

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
      password,
      role: 'ADMIN',
      storeId: storeId.toString(),
    });

    if (user && store) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
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
      role: user.role,
      storeId: user.storeId,
      storeName: store ? store.name : 'Unknown Store',
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

module.exports = { registerUser, loginUser };
