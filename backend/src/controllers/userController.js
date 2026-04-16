const User = require("../models/User");

const getProviders = async (req, res, next) => {
  try {
    const providers = await User.find({ role: { $in: ["pandit", "lama"] }, isVerified: true })
      .select("-password -refreshTokenHash");
    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    next(error);
  }
};

const getPendingProviders = async (req, res, next) => {
  try {
    const pending = await User.find({ role: { $in: ["pandit", "lama"] }, isVerified: false })
      .select("-password -refreshTokenHash");
    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
};

const verifyProvider = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.isVerified = true;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUserProfile,
  getProviders,
  getPendingProviders,
  verifyProvider,
};
