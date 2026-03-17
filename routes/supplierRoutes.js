const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { supplierSchema } = require('../validators/supplierValidator');

router.route('/')
  .get(protect, getSuppliers)
  .post(protect, authorize('ADMIN'), validate(supplierSchema), createSupplier);

router.route('/:id')
  .put(protect, authorize('ADMIN'), validate(supplierSchema), updateSupplier)
  .delete(protect, authorize('ADMIN'), deleteSupplier);

module.exports = router;
