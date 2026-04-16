const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getTodaySpecial,
  getSpecialByDate,
  createSpecial,
  updateSpecial,
  deleteSpecial,
} = require("../controllers/specialController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();
const adminOnly = [protect, authorize("admin")];
const upsertValidation = [
  body("title").optional().trim().isLength({ min: 2 }),
  body("date").optional().isISO8601(),
  body("description").optional().trim().isLength({ max: 1000 }),
  body("religion").optional().isIn(["hindu", "buddhist"]),
];

router.get("/today-special", protect, [query("religion").optional().isIn(["hindu", "buddhist"])], getTodaySpecial);
router.get("/special/:date", protect, [param("date").isISO8601(), query("religion").optional().isIn(["hindu", "buddhist"])], getSpecialByDate);
router.post("/special", ...adminOnly, upsertValidation, createSpecial);
router.put("/special/:id", ...adminOnly, [param("id").isMongoId(), ...upsertValidation], updateSpecial);
router.delete("/special/:id", ...adminOnly, [param("id").isMongoId()], deleteSpecial);

module.exports = router;
