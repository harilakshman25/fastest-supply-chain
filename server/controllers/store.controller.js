// server/controllers/store.controller.js
const Store = require('../models/Store');
const User = require('../models/User');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({ isActive: true }).populate('manager', 'name email');
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Public
exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('manager', 'name email');
    
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    res.json(store);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Store not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get store by manager ID
// @route   GET /api/stores/manager/:managerId
// @access  Private (Store Manager)
exports.getStoreByManager = async (req, res) => {
  try {
    const store = await Store.findOne({ manager: req.params.managerId });
    
    if (!store) {
      return res.status(404).json({ msg: 'Store not found for this manager' });
    }
    
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a store
// @route   POST /api/stores
// @access  Private (Admin)
exports.createStore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, manager, address, contactNumber, email, operatingHours } = req.body;
  
  try {
    // Check if manager exists and is a store manager
    const managerUser = await User.findById(manager);
    
    if (!managerUser || managerUser.role !== 'store_manager') {
      return res.status(400).json({ msg: 'Invalid manager ID' });
    }
    
    // Check if manager already has a store
    const existingStore = await Store.findOne({ manager });
    
    if (existingStore) {
      return res.status(400).json({ msg: 'This manager already has a store' });
    }
    
    const newStore = new Store({
      name,
      manager,
      address,
      contactNumber,
      email,
      operatingHours,
      isActive: true
    });
    
    const store = await newStore.save();
    
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private (Store Manager, Admin)
exports.updateStore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, address, contactNumber, email, operatingHours } = req.body;
  
  // Build store object
  const storeFields = {};
  if (name) storeFields.name = name;
  if (address) storeFields.address = address;
  if (contactNumber) storeFields.contactNumber = contactNumber;
  if (email) storeFields.email = email;
  if (operatingHours) storeFields.operatingHours = operatingHours;
  
  try {
    let store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    // Make sure user is store manager or admin
    if (req.user.role === 'store_manager' && store.manager.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update store
    store = await Store.findByIdAndUpdate(
      req.params.id,
      { $set: storeFields },
      { new: true }
    );
    
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get nearby stores
// @route   GET /api/stores/nearby
// @access  Public
exports.getNearbyStores = async (req, res) => {
  const { lat, lng, maxDistance } = req.query;
  
  // Convert distance to meters (default 5km)
  const distance = maxDistance ? Number(maxDistance) * 1000 : 5000;
  
  try {
    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and longitude are required' });
    }
    
    const stores = await Store.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: distance
        }
      },
      isActive: true
    });
    
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all products in a store
// @route   GET /api/stores/:id/products
// @access  Public
exports.getStoreProducts = async (req, res) => {
  try {
    const products = await Product.find({
      'inventory.store': req.params.id,
      'inventory.quantity': { $gt: 0 }
    });
    
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
