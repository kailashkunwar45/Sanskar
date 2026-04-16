const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const { updateUserProfile, getProviders, getPendingProviders, verifyProvider } = require("../controllers/userController");
const authorize = require("../middlewares/authorize");

router.get("/providers", protect, getProviders);
router.get("/pending", protect, authorize("admin", "superadmin"), getPendingProviders);
router.put("/:id/verify", protect, authorize("admin", "superadmin"), verifyProvider);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
