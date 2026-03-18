const InventoryLog = require('../models/InventoryLog');

const updateStock = async (productId, quantity, action, performedBy = null, note = '') => {
  const Product = require('../models/Product'); // Avoid circular dependency
  
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const previousStock = product.stock;

  if (action === 'ADD') {
    product.stock += quantity;
  } else if (action === 'REMOVE' || action === 'SALE') {
    if (product.stock < quantity) throw new Error('Insufficient stock');
    product.stock -= quantity;
  } else if (action === 'UPDATE') {
    product.stock = quantity;
  } else if (action === 'ADJUSTMENT') {
    product.stock += quantity;
  }

  const newStock = product.stock;
  await product.save();

  // Check stock levels for notifications and reorders
  const { checkStockLevels } = require('./inventoryService');
  await checkStockLevels(product);

  // Log the action with details
  await InventoryLog.create({
    productId,
    productName: product.name,
    action,
    quantity,
    previousStock,
    newStock,
    performedBy,
    note: note || (action === 'SALE' ? 'Sold via billing' : `Manual ${action.toLowerCase()}`),
  });

  return product;
};

module.exports = { updateStock };
