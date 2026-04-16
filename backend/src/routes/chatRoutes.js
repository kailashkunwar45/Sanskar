const express = require("express");
const { body } = require("express-validator");
const { getChats, sendMessage } = require("../controllers/chatController");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.get("/", protect, authorize("customer", "admin"), getChats);
router.post(
  "/messages",
  protect,
  authorize("customer", "admin"),
  [
    body("user").optional().isMongoId(),
    body("admin").optional().isMongoId(),
    body("text").trim().isLength({ min: 1, max: 1000 }),
  ],
  sendMessage
);

module.exports = router;
