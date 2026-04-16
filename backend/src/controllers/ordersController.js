const Order = require("../models/Order");
const Cart = require("../models/cartModel");

// @desc    Convert user cart to an Order (Checkout)
// @route   POST /api/orders/checkout
// @access  Private (Customer)
const createOrderFromCart = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;

    if (!shippingAddress) {
      const error = new Error("shippingAddress is required");
      error.statusCode = 400;
      throw error;
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      const error = new Error("Cart is empty");
      error.statusCode = 400;
      throw error;
    }

    // Validate if all products still exist and recalculate totalPrice
    let recalculatedTotalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        const error = new Error("One or more products in your cart are no longer available");
        error.statusCode = 400;
        throw error;
      }
      
      const itemPrice = item.product.price;
      const itemTotal = itemPrice * item.quantity;
      recalculatedTotalPrice += itemTotal;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: itemPrice
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice: recalculatedTotalPrice,
      status: "placed",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "cod",
      shippingAddress: shippingAddress
    });

    // Clear the cart after successful order creation
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price images category");

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    // Customers can only view their own order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      const error = new Error("Not authorized to view this order");
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const validStatuses = ["placed", "processing", "shipped", "delivered"];
    if (status && !validStatuses.includes(status)) {
      const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (status) {
      order.status = status;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createOrderFromCart,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
