const express = require("express");
const { body } = require("express-validator");
const {
  sendNotification,
  getMyNotifications,
} = require("../controllers/notificationsController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.post(
  "/",
  protect,
  authorize("admin"),
  [body("user").isMongoId(), body("message").trim().isLength({ min: 2, max: 500 }), body("read").optional().isBoolean()],
  sendNotification
);

module.exports = router;
