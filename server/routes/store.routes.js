const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const storeController = require('../controllers/store.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/stores
// @desc    Get all stores
// @access  Public
router.get('/', storeController.getAllStores);

// @route   GET api/stores/manager/:managerId
// @desc    Get store by manager ID
// @access  Private (Store Manager)
router.get('/manager/:managerId', auth, roleCheck(['store_manager', 'admin']), storeController.getStoreByManager);

// @route   GET api/stores/nearby
// @desc    Get nearby stores
// @access  Public
router.get('/nearby', storeController.getNearbyStores);

// @route   GET api/stores/:id
// @desc    Get store by ID
// @access  Public
router.get('/:id', storeController.getStoreById);

// @route   POST api/stores
// @desc    Create a store
// @access  Private (Admin)
router.post(
  '/',
  [
    auth,
    roleCheck(['admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('manager', 'Manager ID is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty()
    ]
  ],
  storeController.createStore
);

// @route   PUT api/stores/:id
// @desc    Update a store
// @access  Private (Store Manager, Admin)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['store_manager', 'admin']),
    [
      check('name', 'Name is required').optional(),
      check('address', 'Address is required').optional(),
      check('contactNumber', 'Contact number is required').optional(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('operatingHours', 'Operating hours are required').optional()
    ]
  ],
  storeController.updateStore
);

// @route   GET api/stores/:id/products
// @desc    Get all products in a store
// @access  Public
router.get('/:id/products', storeController.getStoreProducts);

// @route   GET api/stores/:id/stats
// @desc    Get store statistics
// @access  Private
router.get('/:id/stats', auth, storeController.getStoreStats);

module.exports = router;
