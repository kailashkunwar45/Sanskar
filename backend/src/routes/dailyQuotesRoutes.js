const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getDailyQuotes,
  getTodayQuote,
  createDailyQuote,
  updateDailyQuote,
  deleteDailyQuote,
} = require("../controllers/dailyQuotesController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();
const adminOnly = [protect, authorize("admin")];
const upsertValidation = [
  body("quote").optional().trim().isLength({ min: 2, max: 500 }),
  body("author").optional().trim().isLength({ max: 100 }),
  body("religion").optional().isIn(["hindu", "buddhist"]),
];

router.get("/", protect, getDailyQuotes);
router.get("/today", protect, [query("religion").optional().isIn(["hindu", "buddhist"])], getTodayQuote);
router.post("/", ...adminOnly, upsertValidation, createDailyQuote);
router.put("/:id", ...adminOnly, [param("id").isMongoId(), ...upsertValidation], updateDailyQuote);
router.delete("/:id", ...adminOnly, [param("id").isMongoId()], deleteDailyQuote);

module.exports = router;
