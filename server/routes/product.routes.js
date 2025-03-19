const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const productController = require('../controllers/product.controller');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST api/products
// @desc    Create a product
// @access  Private (Store Manager, Admin)
router.post(
  '/',
  [
    auth,
    roleCheck(['store_manager', 'admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('price', 'Price is required').isNumeric(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  productController.createProduct
);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private (Store Manager, Admin)
router.put(
  '/:id',
  [
    auth,
    roleCheck(['store_manager', 'admin']),
    [
      check('name', 'Name is required').optional(),
      check('price', 'Price is required').optional().isNumeric(),
      check('category', 'Category is required').optional()
    ]
  ],
  productController.updateProduct
);

// @route   PUT api/products/:id/inventory
// @desc    Update product inventory
// @access  Private (Store Manager)
router.put(
  '/:id/inventory',
  [
    auth,
    roleCheck(['store_manager']),
    [
      check('storeId', 'Store ID is required').not().isEmpty(),
      check('quantity', 'Quantity is required').isNumeric()
    ]
  ],
  productController.updateInventory
);

// @route   GET api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', productController.getProductsByCategory);

// @route   GET api/products/search/:term
// @desc    Search products
// @access  Public
router.get('/search/:term', productController.searchProducts);

module.exports = router;
