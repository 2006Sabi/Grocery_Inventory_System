const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { categorySchema } = require('../validators/categoryValidator');

router.route('/')
  .get(protect, getCategories)
  .post(protect, authorize('ADMIN'), validate(categorySchema), createCategory);

router.route('/:id')
  .put(protect, authorize('ADMIN'), validate(categorySchema), updateCategory)
  .delete(protect, authorize('ADMIN'), deleteCategory);

module.exports = router;
