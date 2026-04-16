const { cloudinary } = require("../config/cloudinary");

// @desc    Upload an image to Cloudinary and get back the URL
// @route   POST /api/media/upload
// @access  Admin
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No image file provided");
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an image from Cloudinary
// @route   DELETE /api/media/:publicId
// @access  Admin
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      const error = new Error("Public ID is required to delete an image");
      error.statusCode = 400;
      throw error;
    }

    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, deleteImage };
