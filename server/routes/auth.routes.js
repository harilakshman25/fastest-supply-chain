const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('phoneNumber', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty()
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   POST api/auth/register/manager
// @desc    Register a store manager
// @access  Public
router.post(
  '/register/manager',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('phoneNumber', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('storeName', 'Store name is required').not().isEmpty(),
    check('storeAddress', 'Store address is required').not().isEmpty(),
    check('salesHistory', 'Sales history is required').not().isEmpty()
  ],
  authController.registerManager
);

// @route   POST api/auth/register/delivery
// @desc    Register a delivery person
// @access  Public
router.post(
  '/register/delivery',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('phoneNumber', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('drivingLicense', 'Driving license is required').not().isEmpty(),
    check('qualification', 'Qualification is required').not().isEmpty()
  ],
  authController.registerDelivery
);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getCurrentUser);

// @route   POST api/auth/google
// @desc    Login or Register with Google
// @access  Public
router.post('/google', authController.googleAuth);

// @route   GET api/auth/logout
// @desc    Logout user / clear token
// @access  Private
router.post('/logout', auth, authController.logout);

router.post('/refresh-token', authController.refreshToken);

module.exports = router;
