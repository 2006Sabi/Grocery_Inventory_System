const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductByBarcode,
  getProductsByExpiryPriority,
  toggleAutoReorder,
  getManualReorderProducts
} = require('../controllers/productController');

const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { productSchema } = require('../validators/productValidator');

// Special routes first
router.get('/low-stock', protect, getLowStockProducts);
router.get('/barcode/:barcode', protect, getProductByBarcode);
router.get('/expiry-priority', protect, getProductsByExpiryPriority);
router.get('/manual-reorder', protect, getManualReorderProducts);
router.put('/:id/toggle-reorder', protect, authorize('ADMIN'), toggleAutoReorder);


router.route('/')
  .get(protect, getProducts)
  .post(protect, authorize('ADMIN'), validate(productSchema), createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('ADMIN'), validate(productSchema), updateProduct)
  .delete(protect, authorize('ADMIN'), deleteProduct);

module.exports = router;
