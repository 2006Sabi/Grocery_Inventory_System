const Reorder = require('../models/Reorder');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

// @desc    Get all reorders
// @route   GET /api/reorders
// @access  Private
const getReorders = async (req, res) => {
  try {
    console.log('Fetching all reorders');
    const reorders = await Reorder.find({}).sort({ createdAt: -1 });
    res.json(reorders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reorder by ID
// @route   GET /api/reorders/:id
// @access  Private
const getReorderById = async (req, res) => {
  try {
    console.log('Fetching reorder by ID:', req.params.id);
    const reorder = await Reorder.findById(req.params.id);
    if (reorder) {
      res.json(reorder);
    } else {
      console.log('Reorder not found in DB:', req.params.id);
      res.status(404).json({ message: 'Reorder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a reorder
// @route   POST /api/reorders
// @access  Private
const createReorder = async (req, res) => {
  try {
    const { productName, supplierName, suggestedQuantity, autoReorder, status } = req.body;
    
    const reorder = await Reorder.create({
      productName,
      supplierName,
      suggestedQuantity,
      autoReorder,
      status: status || 'PENDING'
    });

    res.status(201).json(reorder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reorder
// @route   PUT /api/reorders/:id
// @access  Private
const updateReorder = async (req, res) => {
  try {
    const { productName, supplierName, suggestedQuantity, autoReorder, status } = req.body;
    console.log(`Updating reorder ID: ${req.params.id}`, { autoReorder, status });
    const reorder = await Reorder.findById(req.params.id);

    if (reorder) {
      reorder.productName = productName !== undefined ? productName : reorder.productName;
      reorder.supplierName = supplierName !== undefined ? supplierName : reorder.supplierName;
      reorder.suggestedQuantity = suggestedQuantity !== undefined ? suggestedQuantity : reorder.suggestedQuantity;
      reorder.autoReorder = autoReorder !== undefined ? autoReorder : reorder.autoReorder;
      reorder.status = status !== undefined ? status : reorder.status;

      const updatedReorder = await reorder.save();
      res.json(updatedReorder);
    } else {
      res.status(404).json({ message: 'Reorder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reorder status
// @route   PUT /api/reorders/:id/status
// @access  Private
const updateReorderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`Updating reorder status for ID: ${req.params.id} to ${status}`);
    const reorder = await Reorder.findById(req.params.id);

    if (reorder) {
      reorder.status = status;
      const updatedReorder = await reorder.save();
      res.json(updatedReorder);
    } else {
      res.status(404).json({ message: 'Reorder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reorder
// @route   DELETE /api/reorders/:id
// @access  Private
const deleteReorder = async (req, res) => {
  try {
    const reorder = await Reorder.findById(req.params.id);

    if (reorder) {
      await reorder.deleteOne();
      res.json({ message: 'Reorder removed' });
    } else {
      res.status(404).json({ message: 'Reorder not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getReorders, 
  getReorderById,
  createReorder, 
  updateReorder, 
  updateReorderStatus, 
  deleteReorder 
};
