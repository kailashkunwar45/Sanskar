const User = require("../models/User");

const USER_CATEGORIES = ["customer", "vendor", "pandit", "lama", "admin", "superadmin", "unassigned"];

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
    const pending = await User.find({ 
      role: { $in: ["pandit", "lama", "vendor"] }, 
      isVerified: false 
    }).select("-password -refreshTokenHash");
    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    next(error);
  }
};

const getUserSummary = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("-password -refreshTokenHash")
      .sort({ createdAt: -1 });

    const categories = users.reduce((acc, user) => {
      const role = user.role || "unassigned";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, USER_CATEGORIES.reduce((acc, role) => ({ ...acc, [role]: 0 }), {}));

    res.status(200).json({
      success: true,
      data: {
        total: users.length,
        categories,
        users,
      },
    });
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
    res.status(200).json({ success: true, message: "Provider verified successfully", data: user });
  } catch (error) {
    next(error);
  }
};

const declineProvider = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    // We remove the user if declined to allow them to re-register if needed, 
    // or we could set a 'declined' flag. Following the request for simplicity.
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Provider request declined and removed" });
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
  getUserSummary,
  verifyProvider,
  declineProvider,
};
