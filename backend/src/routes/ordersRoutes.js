const express = require("express");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const {
  createOrderFromCart,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} = require("../controllers/ordersController");

const router = express.Router();

router.use(protect);

// Customer endpoints
router.post("/checkout", createOrderFromCart);
router.get("/my-orders", getMyOrders);

// Admin endpoints
router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/status", authorize("admin"), updateOrderStatus);

// Shared endpoint (Protected logic in controller)
router.get("/:id", getOrderById);

module.exports = router;
