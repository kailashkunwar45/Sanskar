const express = require("express");
const { body, param, query } = require("express-validator");
const { getReviews, createReview, deleteReview } = require("../controllers/reviewsController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();
const createValidation = [
  body("targetType").isIn(["Product", "Ritual"]),
  body("target").isMongoId(),
  body("rating").isInt({ min: 1, max: 5 }),
  body("comment").optional().trim().isLength({ max: 1000 }),
];
const queryValidation = [
  query("target").optional().isMongoId(),
  query("targetType").optional().isIn(["Product", "Ritual"]),
];

router.get("/", protect, queryValidation, getReviews);
router.post("/", protect, authorize("customer", "admin", "vendor", "pandit"), createValidation, createReview);
router.delete("/:id", protect, param("id").isMongoId(), deleteReview);

module.exports = router;
