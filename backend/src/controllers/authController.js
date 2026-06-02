const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

function createAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, type: "refresh" },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

async function storeRefreshToken(user, refreshToken) {
  const salt = await bcrypt.genSalt(10);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  await user.save();
}

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

function normalizeAuthError(error) {
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    error.name === "NotBeforeError"
  ) {
    error.statusCode = 401;
    error.message = "Invalid refresh token";
  }

  return error;
}

async function register(req, res, next) {
  try {
    handleValidation(req);
    const { name, email, password, role, religionPreference, phone, address, location, bio, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }

    // Providers and Vendors must be verified by admin; customers are auto-verified
    const isAutoVerified = role === "customer";
    const isVerified = isAutoVerified;

    // Auto-assign religion preference based on role if not explicitly set
    let finalReligion = religionPreference;
    if (!finalReligion) {
      if (role === "pandit") finalReligion = "hindu";
      else if (role === "lama") finalReligion = "buddhist";
    }

    const user = await User.create({
      name, email, password,
      role: role || "customer",
      religionPreference: finalReligion,
      phone, address, location,
      bio, specialization,
      isVerified,
    });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await storeRefreshToken(user, refreshToken);

    return res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      isPendingVerification: isProvider,
    });
  } catch (error) {
    return next(normalizeAuthError(error));
  }
}

async function login(req, res, next) {
  try {
    handleValidation(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await storeRefreshToken(user, refreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(normalizeAuthError(error));
  }
}

async function refresh(req, res, next) {
  try {
    handleValidation(req);
    const { refreshToken } = req.body;

    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    if (payload.type !== "refresh") {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      const error = new Error("Refresh token is not active");
      error.statusCode = 401;
      throw error;
    }

    const isTokenMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isTokenMatch) {
      const error = new Error("Refresh token is not active");
      error.statusCode = 401;
      throw error;
    }

    const accessToken = createAccessToken(user);
    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return next(normalizeAuthError(error));
  }
}

async function logout(req, res, next) {
  try {
    handleValidation(req);
    const { refreshToken } = req.body;

    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findById(payload.sub);

    if (user) {
      user.refreshTokenHash = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(normalizeAuthError(error));
  }
}

module.exports = { register, login, refresh, logout };
