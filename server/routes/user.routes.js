const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getUserProfile);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('name', 'Name is required').optional(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('phoneNumber', 'Phone number is required').optional()
    ]
  ],
  userController.updateUserProfile
);

// @route   GET api/users/address
// @desc    Get user addresses
// @access  Private
router.get('/address', auth, userController.getUserAddresses);

// @route   POST api/users/address
// @desc    Add new address
// @access  Private
router.post(
  '/address',
  [
    auth,
    [
      check('street', 'Street is required').not().isEmpty(),
      check('city', 'City is required').not().isEmpty(),
      check('state', 'State is required').not().isEmpty(),
      check('zipCode', 'Zip code is required').not().isEmpty()
    ]
  ],
  userController.addUserAddress
);

// @route   PUT api/users/address/:id
// @desc    Update address
// @access  Private
router.put(
  '/address/:id',
  [
    auth,
    [
      check('street', 'Street is required').optional(),
      check('city', 'City is required').optional(),
      check('state', 'State is required').optional(),
      check('zipCode', 'Zip code is required').optional()
    ]
  ],
  userController.updateUserAddress
);

// @route   DELETE api/users/address/:id
// @desc    Delete address
// @access  Private
router.delete('/address/:id', auth, userController.deleteUserAddress);

// @route   GET api/users/orders
// @desc    Get user orders
// @access  Private
router.get('/orders', auth, userController.getUserOrders);

module.exports = router;
