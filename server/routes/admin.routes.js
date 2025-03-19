const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, roleCheck(['admin']), adminController.getAllUsers);

// @route   GET api/admin/stores
// @desc    Get all stores
// @access  Private (Admin)
router.get('/stores', auth, roleCheck(['admin']), adminController.getAllStores);

// @route   GET api/admin/pending-approvals
// @desc    Get all pending approvals
// @access  Private (Admin)
router.get('/pending-approvals', auth, roleCheck(['admin']), adminController.getPendingApprovals);

// @route   PUT api/admin/approve/:id
// @desc    Approve a user
// @access  Private (Admin)
router.put('/approve/:id', auth, roleCheck(['admin']),check('id', 'Valid ID is required').isMongoId(), adminController.approveUser);

// @route   PUT api/admin/reject/:id
// @desc    Reject a user
// @access  Private (Admin)
router.put('/reject/:id', auth, roleCheck(['admin']),check('id', 'Valid ID is required').isMongoId(), adminController.rejectUser);

// @route   GET api/admin/analytics
// @desc    Get system analytics
// @access  Private (Admin)
router.get('/analytics', auth, roleCheck(['admin']), adminController.getSystemAnalytics);

// @route   GET api/admin/orders
// @desc    Get all orders
// @access  Private (Admin)
router.get('/orders', auth, roleCheck(['admin']), adminController.getAllOrders);

module.exports = router;
