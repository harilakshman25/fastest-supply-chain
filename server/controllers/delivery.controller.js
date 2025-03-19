// server/controllers/delivery.controller.js
const User = require('../models/User');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

// @desc    Get all available delivery personnel
// @route   GET /api/delivery/available
// @access  Private (Admin)
exports.getAvailableDeliveryPersonnel = async (req, res) => {
  try {
    const deliveryPersonnel = await User.find({
      role: 'delivery',
      isApproved: true
    }).select('-password');
    
    res.json(deliveryPersonnel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get active deliveries for a delivery person
// @route   GET /api/delivery/active
// @access  Private (Delivery)
exports.getActiveDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPerson: req.user.id,
      status: { $in: ['picked_up', 'in_transit'] }
    })
      .sort({ createdAt: 1 })
      .populate('items.product')
      .populate('store')
      .populate('user', 'name phoneNumber');
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update delivery person location
// @route   PUT /api/delivery/location
// @access  Private (Delivery)
exports.updateLocation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { coordinates, orderId } = req.body;
  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ msg: 'Invalid order ID' });
  }
  
  try {
    // Update user location
    await User.findByIdAndUpdate(req.user.id, {
      'address.coordinates.coordinates': coordinates
    });
    
    // Emit event for real-time tracking if orderId is provided
    if (orderId && req.app.get('io')) {
      req.app.get('io').to(`order-${orderId}`).emit('delivery-location-update', {
        location: coordinates
      });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update order status by delivery person
// @route   PUT /api/delivery/orders/:id/status
// @access  Private (Delivery)
exports.updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { status } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if delivery person is assigned to this order
    if (order.deliveryPerson.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this order' });
    }
    
    // Update status
    order.status = status;
    
    // If order is delivered, set actual delivery time
    if (status === 'delivered') {
      order.actualDeliveryTime = Date.now();
      
      // If payment method is COD, update payment status to completed
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'completed';
      }
    }
    
    await order.save();
    
    // Emit event for real-time tracking
    if (req.app.get('io')) {
      req.app.get('io').to(`order-${order._id}`).emit('order-status-update', {
        status: order.status
      });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get delivery history
// @route   GET /api/delivery/history
// @access  Private (Delivery)
exports.getDeliveryHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPerson: req.user.id,
      status: 'delivered'
    })
      .sort({ actualDeliveryTime: -1 })
      .populate('items.product')
      .populate('store')
      .populate('user', 'name');
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get delivery statistics
// @route   GET /api/delivery/stats
// @access  Private (Delivery)
exports.getDeliveryStats = async (req, res) => {
  try {
    const totalDeliveries = await Order.countDocuments({
      deliveryPerson: req.user.id,
      status: 'delivered'
    });
    
    const averageRating = await Order.aggregate([
      {
        $match: {
          deliveryPerson: req.user.id,
          'ratings.delivery.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$ratings.delivery.rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const todayDeliveries = await Order.countDocuments({
      deliveryPerson: req.user.id,
      status: 'delivered',
      actualDeliveryTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    const stats = {
      totalDeliveries,
      todayDeliveries,
      rating: {
        average: averageRating.length > 0 ? averageRating[0].avgRating.toFixed(1) : 0,
        count: averageRating.length > 0 ? averageRating[0].count : 0
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
