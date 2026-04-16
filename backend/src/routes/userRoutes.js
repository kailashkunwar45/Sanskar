const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const { updateUserProfile } = require("../controllers/userController");

router.put("/profile", protect, updateUserProfile);

module.exports = router;
