const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('items', 'Items are required').isArray(),
      check('storeId', 'Store ID is required').not().isEmpty(),
      check('deliveryAddress', 'Delivery address is required').not().isEmpty(),
      check('paymentMethod', 'Payment method is required').not().isEmpty()
    ]
  ],
  orderController.createOrder
);

// @route   GET api/orders
// @desc    Get all orders for the current user
// @access  Private
router.get('/', auth, orderController.getUserOrders);

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, orderController.getOrderById);

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private (Store Manager, Delivery Person)
router.put(
  '/:id/status',
  auth,
  roleCheck(['store_manager', 'delivery', 'admin']),
  orderController.updateOrderStatus
);

// @route   POST api/orders/:id/rate
// @desc    Rate an order (store and delivery)
// @access  Private
router.post(
  '/:id/rate',
  [
    auth,
    check('id', 'Valid order ID is required').isMongoId(),
    check('storeRating').optional().isInt({ min: 1, max: 5 }),
    check('deliveryRating').optional().isInt({ min: 1, max: 5 }),
    check('storeComment').optional().custom((value, { req }) => {
      if (req.body.storeRating && !value) throw new Error('Store comment required if rating provided');
      return true;
    }),
    check('deliveryComment').optional().custom((value, { req }) => {
      if (req.body.deliveryRating && !value) throw new Error('Delivery comment required if rating provided');
      return true;
    })
  ],
  orderController.rateOrder
);

// @route   POST api/orders/:id/return
// @desc    Request a return for an order
// @access  Private
router.post(
  '/:id/return',
  [
    auth,
    [
      check('reason', 'Reason is required').not().isEmpty()
    ]
  ],
  orderController.requestReturn
);

// @route   GET api/orders/store/:storeId
// @desc    Get all orders for a specific store
// @access  Private (Store Manager)
router.get(
  '/store/:storeId',
  auth,
  roleCheck(['store_manager', 'admin']),
  orderController.getStoreOrders
);

// @route   GET api/orders/delivery/active
// @desc    Get active deliveries for delivery person
// @access  Private (Delivery Person)
router.get(
  '/delivery/active',
  auth,
  roleCheck(['delivery']),
  orderController.getActiveDeliveries
);

// @route   PUT api/orders/:id/assign
// @desc    Assign delivery person to an order
// @access  Private (Admin)
router.put(
  '/:id/assign',
  auth,
  roleCheck(['admin']),
  orderController.assignDeliveryPerson
);

module.exports = router;
