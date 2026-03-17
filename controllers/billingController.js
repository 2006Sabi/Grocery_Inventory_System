const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { updateStock } = require('../utils/stockHelper');
const calculateGST = require('../utils/calculateGST');

// @desc    Create a new invoice
// @route   POST /api/billing
// @access  Private
const createInvoice = async (req, res) => {
  const { items, gstRate } = req.body;

  let subtotal = 0;
  const invoiceItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ message: `Product ${item.productId} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    }

    subtotal += product.price * item.quantity;
    invoiceItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const { gstAmount, totalAmount } = calculateGST(subtotal, gstRate);
  const invoiceNumber = `INV-${Date.now()}`;

  const invoice = await Invoice.create({
    invoiceNumber,
    items: invoiceItems,
    subtotal,
    gstRate,
    gstAmount,
    totalAmount,
  });

  // Deduct stock after successful billing
  for (const item of items) {
    await updateStock(item.productId, item.quantity, 'SALE');
  }

  res.status(201).json(invoice);
};

// @desc    Get invoice by ID
// @route   GET /api/billing/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate('items.productId', 'name barcode');
  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404).json({ message: 'Invoice not found' });
  }
};

module.exports = { createInvoice, getInvoiceById };
