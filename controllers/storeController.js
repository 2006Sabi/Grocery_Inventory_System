const Store = require('../models/Store');

// @desc    Get store details
// @route   GET /api/store/:id
// @access  Private
const getStore = async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (store) {
    res.json(store);
  } else {
    res.status(404).json({ message: 'Store not found' });
  }
};

// @desc    Update store details
// @route   PUT /api/store/:id
// @access  Private/Admin
const updateStore = async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (store) {
    store.name = req.body.name || store.name;
    store.gstNumber = req.body.gstNumber !== undefined ? req.body.gstNumber : store.gstNumber;
    store.address = req.body.address !== undefined ? req.body.address : store.address;

    const updatedStore = await store.save();
    res.json(updatedStore);
  } else {
    res.status(404).json({ message: 'Store not found' });
  }
};

module.exports = { getStore, updateStore };
