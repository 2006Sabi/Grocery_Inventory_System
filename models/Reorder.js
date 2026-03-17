const mongoose = require('mongoose');

const reorderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  },
  suggestedQuantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'ORDERED', 'COMPLETED'],
    default: 'PENDING',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Reorder', reorderSchema);
