const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Store = require('../models/Store');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phoneNumber, address } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phoneNumber,
      address,
      role: 'user',
      isApproved: true,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) {User.findByIdAndDelete(user.id);  throw err;}
        const userData = { id: user.id, name, email, role: user.role };
        res.json({ token, user: userData });
      }
    );
    // return res.json({payload});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // See if user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    // Check if user is approved
    user.isApproved=true;
    if (!user.isApproved) {
      return res.status(400).json({ msg: 'Your account is pending approval' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const userData = { id: user.id, name: user.name, email, role: user.role };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: userData });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Register a store manager
// @route   POST /api/auth/register/manager
// @access  Public
exports.registerManager = async (req, res) => {
  console.log("hi");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    name,
    email,
    password,
    phoneNumber,
    address,
    storeName,
    storeAddress,
    salesHistory
  } = req.body;

  try {
    // See if user exists

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    // Create user
    user = new User({
      name,
      email,
      password,
      phoneNumber,
      address:address,
      role: 'store_manager',
      isApproved: true
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
  

    console.log("store creation");
    // Create store
    const store = new Store({
      name: storeName,
      manager: user._id,
      address: storeAddress,
      contactNumber: phoneNumber,
      email,
      salesHistory,
      isActive: false
    });

    await store.save();

    res.json({ msg: 'Registration submitted for approval' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Register a delivery person
// @route   POST /api/auth/register/delivery
// @access  Public
exports.registerDelivery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    email,
    password,
    phoneNumber,
    address,
    drivingLicense,
    qualification
  } = req.body;

  try {
    // See if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Metadata for the delivery person
    const metadata = {
      drivingLicense,
      qualification
    };

    user = new User({
      name,
      email,
      password,
      phoneNumber,
      address,
      role: 'delivery',
      isApproved: false,
      metadata
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({ msg: 'Registration submitted for approval' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Login or Register with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  const { email, name, googleId } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = new User({
        name,
        email,
        googleId, // Using googleId as password
        role: 'user',
        isApproved: true
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(googleId, salt);

      await user.save();
    }

    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Logout user / clear token
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.json({ msg: 'User logged out successfully. Please clear your token client-side.' });
};

exports.refreshToken = async (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newPayload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };
    const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
      expiresIn: '5 days',
    });
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ msg: 'Invalid or expired token' });
  }
};