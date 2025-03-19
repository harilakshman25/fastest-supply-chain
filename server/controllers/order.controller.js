// server/controllers/order.controller.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Store = require('../models/Store');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { items, storeId, deliveryAddress, paymentMethod } = req.body;
  
  try {
    // Verify store exists
    const store = await Store.findById(storeId);
    
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    // Calculate total price and create order items array
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ msg: `Product with ID ${item.productId} not found` });
      }
      
      // Check if store has enough inventory
      const storeInventory = product.inventory.find(
        inv => inv.store.toString() === storeId && inv.quantity >= item.quantity
      );
      
      if (!storeInventory) {
        return res.status(400).json({ msg: `Not enough ${product.name} in stock` });
      }
      
      // Add to order items
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      // Add to total price
      totalAmount += product.price * item.quantity;
      
      // Update inventory (reduce quantity)
      const inventoryIndex = product.inventory.findIndex(
        inv => inv.store.toString() === storeId
      );
      
      product.inventory[inventoryIndex].quantity -= item.quantity;
      await product.save();
    }
    
    // Create new order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      store: storeId,
      totalAmount,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      deliveryAddress
    });
    
    await order.save();
    
    // Add order to user's orders array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { orders: order._id }
    });
    
    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all orders for the current user
// @route   GET /api/orders
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

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('store')
      .populate('deliveryPerson', 'name phoneNumber');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (
      order.user.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      (req.user.role !== 'store_manager' || order.store.toString() !== req.body.storeId) &&
      (req.user.role !== 'delivery' || order.deliveryPerson?.toString() !== req.user.id)
    ) {
      return res.status(401).json({ msg: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Store Manager, Delivery Person)
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check authorization
    if (req.user.role === 'store_manager') {
      // Store managers can only change status to 'processing'
      if (status !== 'processing') {
        return res.status(400).json({ msg: 'Store managers can only set orders to processing status' });
      }
      
      if (order.store.toString() !== req.body.storeId) {
        return res.status(401).json({ msg: 'Not authorized to update this order' });
      }
    } else if (req.user.role === 'delivery') {
      // Delivery person can only update orders assigned to them
      if (order.deliveryPerson?.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to update this order' });
      }
      
      // Delivery person can only change to 'picked_up', 'in_transit', or 'delivered'
      if (!['picked_up', 'in_transit', 'delivered'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status for delivery person' });
      }
    }

    else if (req.user.role !== 'admin') {
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
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Rate an order (store and delivery)
// @route   POST /api/orders/:id/rate
// @access  Private
exports.rateOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { storeRating, deliveryRating, storeComment, deliveryComment } = req.body;

  if (deliveryRating && !Order.deliveryPerson) {
    return res.status(400).json({ msg: 'Cannot rate delivery for an order without a delivery person' });
  }
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if user is authorized to rate this order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to rate this order' });
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ msg: 'Cannot rate an order that is not delivered' });
    }
    
    // Check if already rated
    if (order.ratings && (order.ratings.store.rating || order.ratings.delivery.rating)) {
      return res.status(400).json({ msg: 'Order has already been rated' });
    }
    
    // Create ratings object
    const ratings = {
      store: {},
      delivery: {}
    };
    
    if (storeRating) {
      ratings.store.rating = storeRating;
      ratings.store.comment = storeComment || '';
      
      // Update store's average rating
      const store = await Store.findById(order.store);
      const newRatingCount = store.rating.count + 1;
      const newRatingAverage = (
        (store.rating.average * store.rating.count + storeRating) / newRatingCount
      ).toFixed(1);
      
      store.rating = {
        average: newRatingAverage,
        count: newRatingCount
      };
      
      await store.save();
    }
    
    if (deliveryRating && order.deliveryPerson) {
      ratings.delivery.rating = deliveryRating;
      ratings.delivery.comment = deliveryComment || '';
    }
    
    order.ratings = ratings;
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Request a return for an order
// @route   POST /api/orders/:id/return
// @access  Private
exports.requestReturn = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { reason } = req.body;
  
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if user is authorized to request return for this order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to request return for this order' });
    }
    
    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ msg: 'Cannot request return for an order that is not delivered' });
    }
    
    // Check if return already requested
    if (order.returnRequest.status !== 'none') {
      return res.status(400).json({ msg: 'Return has already been requested for this order' });
    }
    
    // Update return request
    order.returnRequest = {
      status: 'requested',
      reason,
      requestedAt: Date.now()
    };
    
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all orders for a specific store
// @route   GET /api/orders/store/:storeId
// @access  Private (Store Manager)
exports.getStoreOrders = async (req, res) => {
  try {
    // If store manager, verify they manage this store
    if (req.user.role === 'store_manager') {
      const store = await Store.findOne({ 
        _id: req.params.storeId,
        manager: req.user.id
      });
      
      if (!store) {
        return res.status(401).json({ msg: 'Not authorized to view orders for this store' });
      }
    }
    
    const orders = await Order.find({ store: req.params.storeId })
      .sort({ createdAt: -1 })
      .populate('items.product')
      .populate('user', 'name email phoneNumber')
      .populate('deliveryPerson', 'name phoneNumber');
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get active deliveries for delivery person
// @route   GET /api/orders/delivery/active
// @access  Private (Delivery Person)
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

// @desc    Assign delivery person to an order
// @route   PUT /api/orders/:id/assign
// @access  Private (Admin)
exports.assignDeliveryPerson = async (req, res) => {
  const { deliveryPersonId } = req.body;
  
  try {
    // Verify delivery person exists and is approved
    const deliveryPerson = await User.findOne({
      _id: deliveryPersonId,
      role: 'delivery',
      isApproved: true
    });
    
    if (!deliveryPerson) {
      return res.status(404).json({ msg: 'Delivery person not found or not approved' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Assign delivery person
    order.deliveryPerson = deliveryPersonId;
    
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
