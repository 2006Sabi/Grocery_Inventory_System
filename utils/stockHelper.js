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
  }

  await product.save();

  // Log the action
  await InventoryLog.create({
    productId,
    action,
    quantity,
  });

  return product;
};

module.exports = { updateStock };
