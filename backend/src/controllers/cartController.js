const Cart = require("../models/cartModel");
const Product = require("../models/Product");

// Helper to recalculate total price
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (quantity < 1) {
      const error = new Error("Quantity must be at least 1");
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Product exists in cart → increase quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Product not in cart → add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();
    
    const updatedCart = await cart.populate("items.product");
    res.status(200).json(updatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    if (quantity < 1) {
      const error = new Error("Quantity must be at least 1");
      error.statusCode = 400;
      throw error;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.totalPrice = calculateTotal(cart.items);
      
      await cart.save();
      
      const updatedCart = await cart.populate("items.product");
      res.status(200).json(updatedCart);
    } else {
      const error = new Error("Product not found in cart");
      error.statusCode = 404;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.totalPrice = calculateTotal(cart.items);
    
    await cart.save();
    
    const updatedCart = await cart.populate("items.product");
    res.status(200).json(updatedCart);
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    cart.items = [];
    cart.totalPrice = 0;
    
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk add products to cart (used by Ritual "Buy All Items")
// @route   POST /api/cart/bulk
// @access  Private
const bulkAddToCart = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      const error = new Error("productIds must be a non-empty array");
      error.statusCode = 400;
      throw error;
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) {
      const error = new Error("No valid products found");
      error.statusCode = 404;
      throw error;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    let added = 0;
    for (const product of products) {
      const existingIdx = cart.items.findIndex(
        (item) => item.product.toString() === product._id.toString()
      );
      if (existingIdx > -1) {
        cart.items[existingIdx].quantity += 1;
      } else {
        cart.items.push({
          product: product._id,
          quantity: 1,
          price: product.price,
        });
      }
      added++;
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    const updatedCart = await cart.populate("items.product");
    res.status(200).json({
      success: true,
      message: `${added} item(s) added to cart`,
      cart: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  bulkAddToCart
};
