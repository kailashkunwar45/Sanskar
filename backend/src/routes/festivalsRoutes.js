const express = require("express");
const { body } = require("express-validator");
const { getFestivalsByMonth, createFestival, deleteFestival, updateFestival } = require("../controllers/festivalsController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();

const festivalValidation = [
  body("title").notEmpty().isString(),
  body("date").isISO8601(),
  body("religion").optional().isIn(["hindu", "buddhist", "general"]),
  body("description").notEmpty().isString(),
  body("image").optional().isString()
];

// Public
router.get("/month", getFestivalsByMonth);

// Admin-only CRUD
router.post("/", protect, authorize("admin"), festivalValidation, createFestival);
router.put("/:id", protect, authorize("admin"), festivalValidation, updateFestival);
router.delete("/:id", protect, authorize("admin"), deleteFestival);

module.exports = router;
