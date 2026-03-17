const Product = require('../models/Product');
const { updateStock } = require('../utils/stockHelper');
const { getExpiryPriority } = require('../utils/expiryHelper');

// @desc    Get all products with pagination, filtering, sorting
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } }
    : {};

  const categoryFilter = req.query.categoryId ? { categoryId: req.query.categoryId } : {};
  const supplierFilter = req.query.supplierId ? { supplierId: req.query.supplierId } : {};

  const filter = { ...keyword, ...categoryFilter, ...supplierFilter };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('categoryId', 'name')
    .populate('supplierId', 'name')
    .sort(req.query.sort || '-createdAt')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('supplierId', 'name');
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, barcode, categoryId, price, stock, threshold, expiryDate, supplierId } = req.body;

  const productExists = await Product.findOne({ barcode });
  if (productExists) {
    return res.status(400).json({ message: 'Product with this barcode already exists' });
  }

  const product = await Product.create({
    name, barcode, categoryId, price, stock, threshold, expiryDate, supplierId
  });

  res.status(201).json(product);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.barcode = req.body.barcode || product.barcode;
    product.categoryId = req.body.categoryId || product.categoryId;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.threshold = req.body.threshold !== undefined ? req.body.threshold : product.threshold;
    product.expiryDate = req.body.expiryDate || product.expiryDate;
    product.supplierId = req.body.supplierId || product.supplierId;

    const updatedProduct = await product.save();
    
    // Check stock levels for notifications and reorders
    const { checkStockLevels } = require('../utils/inventoryService');
    await checkStockLevels(updatedProduct);

    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
const getLowStockProducts = async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$stock', '$threshold'] }
  }).populate('categoryId', 'name').populate('supplierId', 'name');
  res.json(products);
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Private
const getProductByBarcode = async (req, res) => {
  const product = await Product.findOne({ barcode: req.params.barcode })
    .populate('categoryId', 'name')
    .populate('supplierId', 'name');
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

const getProductsByExpiryPriority = async (req, res) => {
  const products = await Product.find({}).populate('categoryId', 'name');
  
  const prioritized = products.map(p => ({
    ...p.toObject(),
    priority: getExpiryPriority(p.expiryDate)
  }));

  res.json(prioritized);
};

// @desc    Toggle auto-reorder status
// @route   PUT /api/products/:id/toggle-reorder
// @access  Private/Admin
const toggleAutoReorder = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    product.autoReorder = !product.autoReorder;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Get products with auto-reorder OFF and low stock
// @route   GET /api/products/manual-reorder
// @access  Private/Admin
const getManualReorderProducts = async (req, res) => {
  const products = await Product.find({
    autoReorder: false,
    $expr: { $lte: ['$stock', '$threshold'] }
  }).populate('categoryId', 'name').populate('supplierId', 'name');
  res.json(products);
};

module.exports = {
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
};
