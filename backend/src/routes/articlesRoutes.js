const express = require("express");
const { body, param } = require("express-validator");
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articlesController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();
const adminOnly = [protect, authorize("admin")];
const idValidation = [param("id").isMongoId()];
const upsertValidation = [
  body("title").optional().trim().isLength({ min: 2 }),
  body("content").optional().trim().isLength({ min: 5 }),
  body("steps").optional().isArray(),
  body("meaning").optional().trim(),
  body("requiredItems").optional().isArray(),
  body("linkedProducts").optional().isArray(),
  body("category").optional().isIn(["guide", "history", "festival", "mantra", "wellness", "other"]),
  body("religion").optional().isIn(["hindu", "buddhist"]),
];

router.get("/", protect, getArticles);
router.get("/:id", protect, idValidation, getArticleById);
router.post("/", ...adminOnly, upsertValidation, createArticle);
router.put("/:id", ...adminOnly, idValidation, upsertValidation, updateArticle);
router.delete("/:id", ...adminOnly, idValidation, deleteArticle);

module.exports = router;
