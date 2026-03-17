const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

module.exports = router;
