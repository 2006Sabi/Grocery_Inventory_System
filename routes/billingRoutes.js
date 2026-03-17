const express = require('express');
const router = express.Router();
const { createInvoice, getInvoiceById } = require('../controllers/billingController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { billingSchema } = require('../validators/billingValidator');

router.post('/', protect, validate(billingSchema), createInvoice);
router.get('/:id', protect, getInvoiceById);

module.exports = router;
