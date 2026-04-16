const express = require("express");
const { body, param } = require("express-validator");
const {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingsController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();
const adminOnly = [protect, authorize("admin")];
const allowed = [protect, authorize("customer", "admin", "pandit")];
const idValidation = [param("id").isMongoId()];
const createValidation = [
  body("panditOrLama").isMongoId(),
  body("dateTime").isISO8601(),
  body("status").optional().isIn(["pending", "confirmed", "completed", "cancelled"]),
];
const updateValidation = [
  body("status").isIn(["pending", "confirmed", "completed", "cancelled"]),
];

router.get("/", ...allowed, getBookings);
router.post("/", protect, authorize("customer"), createValidation, createBooking);
router.put("/:id", ...allowed, idValidation, updateValidation, updateBooking);
router.delete("/:id", ...adminOnly, idValidation, deleteBooking);

module.exports = router;
