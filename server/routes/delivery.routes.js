const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const deliveryController = require('../controllers/delivery.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/delivery/available
// @desc    Get all available delivery personnel
// @access  Private (Admin)
router.get('/available', auth, roleCheck(['admin']), deliveryController.getAvailableDeliveryPersonnel);

// @route   GET api/delivery/active
// @desc    Get active deliveries for a delivery person
// @access  Private (Delivery)
router.get('/active', auth, roleCheck(['delivery']), deliveryController.getActiveDeliveries);

// @route   PUT api/delivery/location
// @desc    Update delivery person location
// @access  Private (Delivery)
router.put(
  '/location',
  [auth, roleCheck(['delivery']), check('coordinates', 'Coordinates are required').not().isEmpty()],
  deliveryController.updateLocation
);

// @route   PUT api/delivery/orders/:id/status
// @desc    Update order status by delivery person
// @access  Private (Delivery)
router.put(
  '/orders/:id/status',
  [
    auth,
    roleCheck(['delivery']),
    check('id', 'Valid order ID is required').isMongoId(),
    check('status', 'Status is required').isIn(['picked_up', 'in_transit', 'delivered'])
  ],
  deliveryController.updateOrderStatus
);

// @route   GET api/delivery/history
// @desc    Get delivery history
// @access  Private (Delivery)
router.get('/history', auth, roleCheck(['delivery']), deliveryController.getDeliveryHistory);

// @route   GET api/delivery/stats
// @desc    Get delivery statistics
// @access  Private (Delivery)
router.get('/stats', auth, roleCheck(['delivery']), deliveryController.getDeliveryStats);

module.exports = router;
