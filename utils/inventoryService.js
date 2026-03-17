const Notification = require('../models/Notification');
const User = require('../models/User');
const Reorder = require('../models/Reorder');
const sendEmail = require('./emailService');

const checkStockLevels = async (product) => {
  const { stock, threshold, name, _id, autoReorder, lastAlertSent, supplierId } = product;

  // 1. Trigger Notifications
  let type = '';
  let message = '';

  if (stock === 0) {
    type = 'OUT_OF_STOCK';
    message = `Product "${name}" is out of stock!`;
  } else if (stock <= threshold) {
    type = 'LOW_STOCK';
    message = `Product "${name}" is low on stock (${stock} remaining).`;
  }

  if (type) {
    const users = await User.find({ storeId: product.storeId });
    const recipients = users.map(u => u._id);

    await Notification.create({
      message,
      type,
      productId: _id,
      recipients,
    });
  }

  // 2. Handle Reorder Logic
  if (stock <= threshold) {
    if (autoReorder) {
      // Automatically create reorder if not already pending
      const pendingReorder = await Reorder.findOne({ productId: _id, status: 'PENDING' });
      if (!pendingReorder) {
        await Reorder.create({
          productId: _id,
          supplierId,
          quantity: threshold * 2, // Simple logic for suggested quantity
          status: 'PENDING',
        });
      }
    } else {
      // Send email alert to admin if not sent today
      const today = new Date().setHours(0, 0, 0, 0);
      if (!lastAlertSent || new Date(lastAlertSent).getTime() < today) {
        const admin = await User.findOne({ storeId: product.storeId, role: 'ADMIN' });
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
};

module.exports = { checkStockLevels };
