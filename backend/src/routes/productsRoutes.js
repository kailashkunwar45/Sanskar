const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();
const vendorOrAdmin = [protect, authorize("vendor", "admin")];
const idValidation = [param("id").isMongoId()];
const queryValidation = [
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("category").optional().isString().trim(),
  query("search").optional().isString().trim(),
];
const upsertValidation = [
  body("name").optional().trim().isLength({ min: 2 }),
  body("description").optional().trim().isLength({ min: 5 }),
  body("price").optional().isFloat({ min: 0 }),
  body("images").optional().isArray(),
  body("category").optional().custom(value => {
    const allowed = ["pooja-item", "statue", "clothing", "book", "accessory", "other"];
    if (Array.isArray(value)) {
      return value.every(v => allowed.includes(v));
    }
    return allowed.includes(value);
  }),
  body("culturalCategory").optional().custom(value => {
    const allowed = ["hindu", "buddhist"];
    if (Array.isArray(value)) {
      return value.every(v => allowed.includes(v));
    }
    return allowed.includes(value);
  }),
  body("ritualCategory").optional().custom(value => {
    const allowed = ["festival", "daily", "ceremony", "wedding", "funeral", "other"];
    if (Array.isArray(value)) {
      return value.every(v => allowed.includes(v));
    }
    return allowed.includes(value);
  }),
  body("stock").optional().isInt({ min: 0 }),
  body("vendor").optional().isMongoId(),
];

router.get("/", protect, queryValidation, getProducts);
router.get("/:id", protect, idValidation, getProductById);
router.post("/", ...vendorOrAdmin, upsertValidation, createProduct);
router.put("/:id", ...vendorOrAdmin, idValidation, upsertValidation, updateProduct);
router.delete("/:id", ...vendorOrAdmin, idValidation, deleteProduct);

module.exports = router;
