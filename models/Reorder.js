const mongoose = require('mongoose');

const reorderSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  suggestedQuantity: {
    type: Number,
    required: true
  },
  autoReorder: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['PENDING', 'ORDERED', 'COMPLETED'],
    default: 'PENDING'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reorder', reorderSchema);
