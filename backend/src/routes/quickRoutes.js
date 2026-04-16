const express = require("express");
const {
  getQuickRituals,
  getQuickProducts,
  getQuickBookings,
} = require("../controllers/quickController");
const protect = require("../middlewares/protect");

const router = express.Router();

router.get("/quick/rituals", protect, getQuickRituals);
router.get("/quick/products", protect, getQuickProducts);
router.get("/quick/bookings", protect, getQuickBookings);

module.exports = router;
