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
    const managerId = req.params.managerId;
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ msg: 'Invalid manager ID' });
    }
    const store = await Store.findOne({ manager: new mongoose.Types.ObjectId(managerId), isActive: true });
    if (!store) {
      return res.status(404).json({ msg: 'Store not found for this manager' });
    }
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getStoreStats = async (req, res) => {
  try {
    const storeId = req.params.id;
    const { timeRange } = req.query; // e.g., 'day', 'week', 'month', 'year'

    // Verify that the store exists and the user is authorized
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    if (req.user.role === 'store_manager' && store.manager.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Define the date range based on timeRange
    let startDate;
    const now = new Date();
    switch (timeRange) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get orders for the store within the date range
    const orders = await Order.find({
      store: storeId,
      createdAt: { $gte: startDate },
    });

    // Calculate total orders and total revenue
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get total products in the store
    const products = await Product.find({ 'inventory.store': storeId });
    const totalProducts = products.length;

    // Calculate top products (based on quantity sold in orders)
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = { quantity: 0, revenue: 0, name: item.name };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.keys(productSales)
      .map(productId => ({
        name: productSales[productId].name,
        quantity: productSales[productId].quantity,
        revenue: productSales[productId].revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Return the stats
    res.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      topProducts,
    });
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
