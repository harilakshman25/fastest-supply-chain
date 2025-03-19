// server/controllers/product.controller.js
const Product = require('../models/Product');
const Store = require('../models/Store');
const { validationResult } = require('express-validator');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
// Example correction for getAllProducts function
exports.getAllProducts = async (req, res) => {
    try {
      const { category, store, search, sort } = req.query;
      let query = {};
      
      // Build query filters
      if (category) {
        query.category = category;
      }
      
      if (store) {
        query.inventory = { $elemMatch: { store: store } };
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Initial find query
      let productsQuery = Product.find(query).populate({
        path: 'inventory.store',
        select: 'name address'
      });
      
      // Sorting
      if (sort) {
        if (sort === 'price_asc') {
          productsQuery = productsQuery.sort({ price: 1 });
        } else if (sort === 'price_desc') {
          productsQuery = productsQuery.sort({ price: -1 });
        } else if (sort === 'newest') {
          productsQuery = productsQuery.sort({ createdAt: -1 });
        }
      } else {
        // Default sort by newest
        productsQuery = productsQuery.sort({ createdAt: -1 });
      }
      
      const products = await productsQuery.exec();
      
      res.json(products);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};
  
// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('inventory.store', 'name address');
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Store Manager, Admin)
exports.createProduct = async (req, res) => {
    try {
      const { name, description, price, category, image, inventory } = req.body;
      
      
      // Create product
      const newProduct = new Product({
        name,
        description,
        price,
        category,
        image
      });
      
      // Add inventory if provided
      if (inventory && inventory.length > 0) {
        newProduct.inventory = inventory;
      }
      
      await newProduct.save();
      
      // Populate store data for response
      const product = await Product.findById(newProduct._id).populate({
        path: 'inventory.store',
        select: 'name address'
      });
      
      res.status(201).json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Store Manager, Admin)
exports.updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, description, price, category, image } = req.body;
  
  // Build product object
  const productFields = {};
  if (name) productFields.name = name;
  if (description) productFields.description = description;
  if (price) productFields.price = price;
  if (category) productFields.category = category;
  if (image) productFields.image = image;
  
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // If store manager, verify they manage a store that has this product
    if (req.user.role === 'store_manager') {
      const store = await Store.findOne({ manager: req.user.id });
      
      if (!store) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
      
      // Check if this store has this product in inventory
      const storeHasProduct = product.inventory.some(
        item => item.store.toString() === store._id.toString()
      );
      
      if (!storeHasProduct) {
        return res.status(401).json({ msg: 'Not authorized to update this product' });
      }
    }
    
    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productFields },
      { new: true }
    );
    
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update product inventory
// @route   PUT /api/products/:id/inventory
// @access  Private (Store Manager)
exports.updateInventory = async (req, res) => {
    try {
      const { productId } = req.params;
      const { storeId, quantity } = req.body;
      
      // Validation
      if (!storeId || quantity === undefined) {
        return res.status(400).json({ 
          msg: 'Please provide storeId and quantity' 
        });
      }
      
      // Find product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ msg: 'Product not found' });
      }
      
      // Check if inventory exists for this store
      const inventoryIndex = product.inventory.findIndex(
        item => item.store.toString() === storeId
      );
      
      if (inventoryIndex > -1) {
        // Update existing inventory
        product.inventory[inventoryIndex].quantity = quantity;
      } else {
        // Add new inventory entry
        product.inventory.push({
          store: storeId,
          quantity
        });
      }
      
      await product.save();
      
      // Return updated product with populated store data
      const updatedProduct = await Product.findById(productId).populate({
        path: 'inventory.store',
        select: 'name address'
      });
      
      res.json(updatedProduct);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Search products
// @route   GET /api/products/search/:term
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: req.params.term, $options: 'i' } },
        { description: { $regex: req.params.term, $options: 'i' } }
      ]
    });
    
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
