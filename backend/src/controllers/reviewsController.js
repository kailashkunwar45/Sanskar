const { validationResult } = require("express-validator");
const Review = require("../models/Review");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getReviews(req, res, next) {
  try {
    const filter = {};
    if (req.query.target) filter.target = req.query.target;
    if (req.query.targetType) filter.targetType = req.query.targetType;

    const reviews = await Review.find(filter).populate("user", "name role").lean();
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return next(error);
  }
}

async function createReview(req, res, next) {
  try {
    assertValid(req);
    const created = await Review.create({ ...req.body, user: req.user._id });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      const error = new Error("Review not found");
      error.statusCode = 404;
      throw error;
    }

    const canDelete = req.user.role === "admin" || req.user._id.toString() === review.user.toString();
    if (!canDelete) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }

    await review.deleteOne();
    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getReviews, createReview, deleteReview };
