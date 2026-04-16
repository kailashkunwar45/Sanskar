const express = require("express");
const protect = require("../middlewares/protect");
const {
  initiateEsewaPayment,
  verifyEsewaPayment,
  initiateKhaltiPayment,
  verifyKhaltiPayment
} = require("../controllers/paymentController");

const router = express.Router();

router.use(protect);

// eSewa Routes
router.post("/esewa/initiate", initiateEsewaPayment);
router.post("/esewa/verify", verifyEsewaPayment);

// Khalti Routes
router.post("/khalti/initiate", initiateKhaltiPayment);
router.post("/khalti/verify", verifyKhaltiPayment);

module.exports = router;
