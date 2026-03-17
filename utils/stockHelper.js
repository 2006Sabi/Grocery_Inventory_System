const InventoryLog = require('../models/InventoryLog');

const updateStock = async (productId, quantity, action) => {
  const Product = require('../models/Product'); // Avoid circular dependency
  
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

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

  await product.save();

  // Check stock levels for notifications and reorders
  const { checkStockLevels } = require('./inventoryService');
  await checkStockLevels(product);

  // Log the action
  await InventoryLog.create({
    productId,
    action,
    quantity,
  });

  return product;
};

module.exports = { updateStock };
