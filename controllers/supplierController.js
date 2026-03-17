const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  const suppliers = await Supplier.find({});
  res.json(suppliers);
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = async (req, res) => {
  const { name, phone, email, address, contactPerson } = req.body;

  const supplier = await Supplier.create({ name, phone, email, address, contactPerson });
  res.status(201).json(supplier);
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    supplier.name = req.body.name || supplier.name;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.email = req.body.email || supplier.email;
    supplier.address = req.body.address || supplier.address;
    supplier.contactPerson = req.body.contactPerson || supplier.contactPerson;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } else {
    res.status(404).json({ message: 'Supplier not found' });
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    await supplier.deleteOne();
    res.json({ message: 'Supplier removed' });
  } else {
    res.status(404).json({ message: 'Supplier not found' });
  }
};

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
