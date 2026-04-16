const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  bulkAddToCart,
} = require("../controllers/cartController");

// All cart routes require user to be logged in
router.use(protect);

router.route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.post("/bulk", bulkAddToCart);

router.route("/:id")
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
