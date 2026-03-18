const Notification = require('../models/Notification');
const User = require('../models/User');
const Reorder = require('../models/Reorder');
const sendEmail = require('./emailService');

const checkExpiryLevels = async (product) => {
  const { expiryDate, name, _id, storeId, stock } = product;
  const today = new Date();
  const diffTime = new Date(expiryDate) - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let message = '';

  if (diffDays < 0) {
    message = `Product "${name}" has EXPIRED!`;
  } else if (diffDays === 1) {
    message = `Product "${name}" is about to expire in 1 day. Expiry Date: ${new Date(expiryDate).toLocaleDateString()}`;
  } else if (diffDays <= 3) {
    message = `Product "${name}" will expire within 3 days!`;
  } else if (diffDays <= 7) {
    message = `Product "${name}" will expire within 7 days.`;
  }

  if (message) {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const existing = await Notification.findOne({
      productId: _id,
      type: 'EXPIRY',
      message, // Same message check
      createdAt: { $gte: todayStart }
    });

    if (!existing) {
      const users = await User.find({ storeId, role: { $in: ['ADMIN', 'STAFF'] } });
      const recipients = users.map(u => u._id);

      await Notification.create({
        message,
        type: 'EXPIRY',
        productId: _id,
        productName: name,
        stock,
        expiryDate,
        recipients,
      });
    }
  }
};

const checkStockLevels = async (product) => {
  const { stock, threshold, name, _id, autoReorder, lastAlertSent, supplierId, storeId, expiryDate } = product;

  // 1. Trigger Notifications
  let type = '';
  let message = '';

  if (stock === 0) {
    type = 'OUT_OF_STOCK';
    message = `Product "${name}" is OUT OF STOCK.`;
  } else if (stock <= threshold) {
    type = 'LOW_STOCK';
    message = `Product "${name}" is low on stock (${stock} remaining).`;
  }

  if (type) {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const existing = await Notification.findOne({
      productId: _id,
      type,
      createdAt: { $gte: todayStart }
    });

    if (!existing) {
      const users = await User.find({ storeId, role: { $in: ['ADMIN', 'STAFF'] } });
      const recipients = users.map(u => u._id);

      await Notification.create({
        message,
        type,
        productId: _id,
        productName: name,
        stock,
        expiryDate,
        recipients,
      });
    }
  }

  // 2. Handle Reorder Logic
  if (stock <= threshold) {
    if (autoReorder) {
      const pendingReorder = await Reorder.findOne({ productId: _id, status: 'PENDING' });
      if (!pendingReorder) {
        // Fetch product and supplier names for the Reorder record
        const Product = require('../models/Product');
        const Supplier = require('../models/Supplier');
        
        const fullProduct = await Product.findById(_id).populate('supplierId');
        const supplierName = fullProduct.supplierId ? fullProduct.supplierId.name : 'Unknown Supplier';

        console.log(`Creating automatic reorder for ${name}`);
        await Reorder.create({
          productId: _id,
          productName: name,
          supplierId,
          supplierName: supplierName,
          suggestedQuantity: threshold * 2,
          status: 'PENDING',
          autoReorder: true
        });
      }
    } else {
      const today = new Date().setHours(0, 0, 0, 0);
      if (!lastAlertSent || new Date(lastAlertSent).getTime() < today) {
        const admin = await User.findOne({ storeId, role: 'ADMIN' });
        if (admin) {
          const emailOptions = {
            email: admin.email,
            subject: 'Stock Alert - Action Required',
            message: `Product Name: ${name}
Current Stock: ${stock}
Threshold: ${threshold}
Suggested Reorder Quantity: ${threshold * 2}

Message: Stock is low. Enable auto reorder or place order manually.`,
          };

          try {
            await sendEmail(emailOptions);
            product.lastAlertSent = new Date();
            await product.save();
          } catch (error) {
            console.error('Failed to send email:', error.message);
          }
        }
      }
    }
  }
  
  // 3. Trigger Expiry Check
  await checkExpiryLevels(product);
};

module.exports = { checkStockLevels, checkExpiryLevels };
