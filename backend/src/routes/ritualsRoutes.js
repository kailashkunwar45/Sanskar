const express = require("express");
const { body, param } = require("express-validator");
const {
  getRituals,
  getRitualById,
  createRitual,
  updateRitual,
  deleteRitual,
} = require("../controllers/ritualsController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();
const adminOnly = [protect, authorize("admin")];
const idValidation = [param("id").isMongoId()];
const upsertValidation = [
  body("title").optional().trim().isLength({ min: 2 }),
  body("steps").optional().isArray(),
  body("checklist").optional().isArray(),
  body("meaning").optional().trim(),
  body("requiredItems").optional().isArray(),
  body("linkedProducts").optional().isArray(),
  body("category").optional().isIn(["festival", "daily", "ceremony", "wedding", "funeral", "other"]),
  body("religion").optional().isIn(["hindu", "buddhist"]),
];

router.get("/", protect, getRituals);
router.get("/:id", protect, idValidation, getRitualById);
router.post("/", ...adminOnly, upsertValidation, createRitual);
router.put("/:id", ...adminOnly, idValidation, upsertValidation, updateRitual);
router.delete("/:id", ...adminOnly, idValidation, deleteRitual);

module.exports = router;
