const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const { updateUserProfile, getProviders, getPendingProviders, getUserSummary, verifyProvider, declineProvider } = require("../controllers/userController");
const authorize = require("../middlewares/authorize");

router.get("/providers", protect, getProviders);
router.get("/pending", protect, authorize("admin", "superadmin"), getPendingProviders);
router.get("/summary", protect, authorize("admin", "superadmin"), getUserSummary);
router.put("/:id/verify", protect, authorize("admin", "superadmin"), verifyProvider);
router.delete("/:id/decline", protect, authorize("admin", "superadmin"), declineProvider);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
