const express = require('express');
const router = express.Router();
const { createStaff, getStaff, getProfile, updateProfile } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { staffSchema } = require('../validators/authValidator');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.post('/create-staff', protect, admin, validate(staffSchema), createStaff);

router.get('/staff', protect, admin, getStaff);

module.exports = router;
