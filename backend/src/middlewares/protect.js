const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== "access") {
      const error = new Error("Invalid access token");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(payload.sub).select("-password -refreshTokenHash");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = protect;
