const express = require("express");
const protect = require("../middlewares/protect");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");
const { uploadImage, deleteImage } = require("../controllers/mediaController");

const router = express.Router();

// All media routes are private and restricted to admin/superadmin
router.use(protect);
router.use(authorize("admin", "superadmin"));

// POST /api/media/upload
router.post("/upload", upload.single("image"), uploadImage);

// DELETE /api/media/:publicId
router.delete("/:publicId", deleteImage);

module.exports = router;
