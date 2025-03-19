// server/controllers/admin.controller.js
const User = require('../models/User');
const Store = require('../models/Store');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all stores
// @route   GET /api/admin/stores
// @access  Private (Admin)
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('manager', 'name email');
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all pending approvals
// @route   GET /api/admin/pending-approvals
// @access  Private (Admin)
exports.getPendingApprovals = async (req, res) => {
  try {
    const users = await User.find({
      isApproved: false,
      role: { $in: ['store_manager', 'delivery'] }
    }).select('-password');
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Approve a user
// @route   PUT /api/admin/approve/:id
// @access  Private (Admin)
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid user ID' });
    }
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Set user as approved
    user.isApproved = true;
    await user.save();
    
    // If user is store manager, approve their store
    if (user.role === 'store_manager') {
      await Store.findOneAndUpdate(
        { manager: user._id },
        { isActive: true }
      );
    }
    
    res.json({ msg: 'User approved successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Reject a user
// @route   PUT /api/admin/reject/:id
// @access  Private (Admin)
exports.rejectUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    
    // If user was a store manager, delete their store
    await Store.findOneAndDelete({ manager: req.params.id });
    
    res.json({ msg: 'User rejected and removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getSystemAnalytics = async (req, res) => {
  const { timeRange } = req.query;
  
  // Set time ranges
  let startDate = new Date();
  switch (timeRange) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7); // Default to week
  }
  
  try {
    // Total orders
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    // Orders from previous period for comparison
    const previousPeriodStart = new Date(startDate);
    const timeOffset = new Date() - startDate;
    previousPeriodStart.setTime(previousPeriodStart.getTime() - timeOffset);
    
    const previousPeriodOrders = await Order.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });
    
    // Calculate order growth
    const orderGrowth = previousPeriodOrders === 0 ? 100 : 
      Math.round((totalOrders - previousPeriodOrders) / previousPeriodOrders * 100);
    
    // Total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Revenue from previous period
    const previousRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: startDate },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const previousRevenue = previousRevenueResult.length > 0 ? previousRevenueResult[0].total : 0;
    
    // Calculate revenue growth
    const revenueGrowth = previousRevenue === 0 ? 100 : 
      Math.round((totalRevenue - previousRevenue) / previousRevenue * 100);
    
    // Active users
    const activeUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate }
    });
    
    // Users from previous period
    const previousUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });
    
    // Calculate user growth
    const userGrowth = previousUsers === 0 ? 100 : 
      Math.round((activeUsers - previousUsers) / previousUsers * 100);
    
    // Average delivery time
    const deliveryTimeResult = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          actualDeliveryTime: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          deliveryTime: { 
            $divide: [
              { $subtract: ['$actualDeliveryTime', '$createdAt'] }, 
              60000 // Convert ms to minutes
            ] 
          }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$deliveryTime' }
        }
      }
    ]);
    
    const avgDeliveryTime = deliveryTimeResult.length > 0 ? 
      Math.round(deliveryTimeResult[0].avg) : 0;
    
    // Previous period delivery time
    const previousDeliveryTimeResult = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          actualDeliveryTime: { $exists: true },
          createdAt: { $gte: previousPeriodStart, $lt: startDate }
        }
      },
      {
        $project: {
          deliveryTime: { 
            $divide: [
              { $subtract: ['$actualDeliveryTime', '$createdAt'] }, 
              60000 // Convert ms to minutes
            ] 
          }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$deliveryTime' }
        }
      }
    ]);
    
    const previousAvgDeliveryTime = previousDeliveryTimeResult.length > 0 ? 
      Math.round(previousDeliveryTimeResult[0].avg) : 0;
    
    // Calculate delivery time change (negative is better)
    const deliveryTimeChange = previousAvgDeliveryTime === 0 ? 0 : 
      Math.round((avgDeliveryTime - previousAvgDeliveryTime) / previousAvgDeliveryTime * 100);
    
    // Order trends over time
    const orderTrends = await getOrderTrends(startDate, timeRange);
    
    // Revenue trends over time
    const revenueTrends = await getRevenueTrends(startDate, timeRange);
    
    // Top selling products
    const topProducts = await getTopProducts(startDate);
    
    // Store performance
    const storePerformance = await getStorePerformance(startDate);
    
    // User activity by hour
    const userActivity = await getUserActivity(startDate);
    
    // Compile all analytics
    const analytics = {
      totalOrders,
      orderGrowth,
      totalRevenue,
      revenueGrowth,
      activeUsers,
      userGrowth,
      avgDeliveryTime,
      deliveryTimeChange,
      orderTrends,
      revenueTrends,
      topProducts,
      storePerformance,
      userActivity
    };
    
    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Helper function to get order trends
const getOrderTrends = async (startDate, timeRange) => {
  let groupBy;
  let dateFormat;
  
  switch (timeRange) {
    case 'day':
      groupBy = { hour: { $hour: '$createdAt' } };
      dateFormat = (group) => `${group._id.hour}:00`;
      break;
    case 'week':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.day}`;
      break;
    case 'month':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.day}`;
      break;
    case 'year':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.year}`;
      break;
    default:
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.day}`;
  }
  
  const ordersByDate = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: groupBy,
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
    }
  ]);
  
  return ordersByDate.map(group => ({
    date: dateFormat(group),
    orders: group.orders
  }));
};

// Helper function to get revenue trends
const getRevenueTrends = async (startDate, timeRange) => {
  let groupBy;
  let dateFormat;
  
  switch (timeRange) {
    case 'day':
      groupBy = { hour: { $hour: '$createdAt' } };
      dateFormat = (group) => `${group._id.hour}:00`;
      break;
    case 'week':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.day}`;
      break;
    case 'month':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.day}`;
      break;
    case 'year':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.year}`;
      break;
    default:
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = (group) => `${group._id.month}/${group._id.day}`;
  }
  
  const revenueByDate = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled'] }
      }
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
    }
  ]);
  
  return revenueByDate.map(group => ({
    date: dateFormat(group),
    revenue: group.revenue
  }));
};

// Helper function to get top products
const getTopProducts = async (startDate) => {
  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled'] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        sales: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    {
      $sort: { sales: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        name: '$product.name',
        sales: 1,
        revenue: 1
      }
    }
  ]);
  
  return topProducts;
};

// Helper function to get store performance
const getStorePerformance = async (startDate) => {
  const storePerformance = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['cancelled'] }
      }
    },
    {
      $group: {
        _id: '$store',
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { orders: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'stores',
        localField: '_id',
        foreignField: '_id',
        as: 'store'
      }
    },
    {
      $unwind: '$store'
    },
    {
      $project: {
        name: '$store.name',
        orders: 1,
        revenue: 1
      }
    }
  ]);
  
  return storePerformance;
};

// Helper function to get user activity by hour
const getUserActivity = async (startDate) => {
  const userActivity = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { hour: { $hour: '$createdAt' } },
        orders: { $sum: 1 },
        users: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        time: { $concat: [{ $toString: '$_id.hour' }, ':00'] },
        orders: 1,
        users: { $size: '$users' }
      }
    },
    {
      $sort: { '_id.hour': 1 }
    }
  ]);
  
  return userActivity;
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.product')
      .populate('store')
      .populate('user', 'name email')
      .populate('deliveryPerson', 'name email');
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
