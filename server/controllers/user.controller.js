const User = require('../models/User');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, email, phoneNumber } = req.body;
  
  // Build user object
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;
  if (phoneNumber) userFields.phoneNumber = phoneNumber;
  
  try {
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user addresses
// @route   GET /api/users/address
// @access  Private
exports.getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('address');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.address);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Add user address
// @route   POST /api/users/address
// @access  Private
exports.addUserAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { street, city, state, zipCode, coordinates } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Create address object
    const newAddress = {
      street,
      city,
      state,
      zipCode,
      coordinates: coordinates || {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates if not provided
      }
    };
    
    // Update address
    user.address = newAddress;
    
    await user.save();
    
    res.json(user.address);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user address
// @route   PUT /api/users/address/:id
// @access  Private
exports.updateUserAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // For multiple addresses support later
  // const addressId = req.params.id;
  const { street, city, state, zipCode, coordinates } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Build address fields
    const addressFields = {};
    if (street) addressFields.street = street;
    if (city) addressFields.city = city;
    if (state) addressFields.state = state;
    if (zipCode) addressFields.zipCode = zipCode;
    if (coordinates) addressFields['coordinates.coordinates'] = coordinates;
    
    // Update main address for now (will be extended for multiple addresses)
    await User.findByIdAndUpdate(
      req.user.id,
      { $set: { address: { ...user.address.toObject(), ...addressFields } } },
      { new: true }
    );
    
    // Get updated user
    const updatedUser = await User.findById(req.user.id).select('address');
    
    res.json(updatedUser.address);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete user address
// @route   DELETE /api/users/address/:id
// @access  Private
exports.deleteUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // For now, just clear the address (will be extended for multiple addresses)
    user.address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
    
    await user.save();
    
    res.json({ msg: 'Address removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product')
      .populate('store')
      .populate('deliveryPerson', 'name phoneNumber');
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
