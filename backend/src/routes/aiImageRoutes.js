const express = require("express");
const { body } = require("express-validator");
const { generateImage } = require("../controllers/aiImageController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();

const generationValidation = [
  body("prompt").notEmpty().isString(),
  body("type").isIn(["products", "rituals", "articles"])
];

// Admin and Vendor only
router.post("/generate", protect, authorize("admin", "vendor"), generationValidation, generateImage);

module.exports = router;
