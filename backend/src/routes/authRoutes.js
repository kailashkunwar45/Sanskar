const express = require("express");
const { body } = require("express-validator");
const { register, login, refresh, logout } = require("../controllers/authController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();

const registerValidation = [
  body("name").isString().trim().isLength({ min: 2, max: 80 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().trim().isLength({ min: 8, max: 128 }),
  body("role").optional().isIn(["customer", "admin", "vendor", "pandit"]),
  body("religionPreference").optional().isIn(["hindu", "buddhist"]),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().trim().isLength({ min: 8, max: 128 }),
];

const refreshValidation = [body("refreshToken").isString().trim().notEmpty()];
const logoutValidation = [body("refreshToken").isString().trim().notEmpty()];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshValidation, refresh);
router.post("/logout", logoutValidation, logout);
router.get("/me", protect, authorize("customer", "admin", "vendor", "pandit"), (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
});

module.exports = router;
