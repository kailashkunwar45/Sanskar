const { validationResult } = require("express-validator");
const Booking = require("../models/Booking");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getBookings(req, res, next) {
  try {
    let filter = {};
    if (req.user.role !== "admin") {
      filter = { $or: [{ user: req.user._id }, { panditOrLama: req.user._id }] };
    }
    const bookings = await Booking.find(filter)
      .populate("user", "name email role")
      .populate("panditOrLama", "name email role")
      .sort({ dateTime: 1 })
      .lean();
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    assertValid(req);
    const User = require("../models/User");
    const provider = await User.findById(req.body.panditOrLama);
    if (!provider) {
      const error = new Error("Provider not found");
      error.statusCode = 404;
      throw error;
    }
    if (!provider.isVerified) {
      const error = new Error("This provider is pending admin verification and cannot accept bookings yet.");
      error.statusCode = 400;
      throw error;
    }

    const created = await Booking.create({ ...req.body, user: req.user._id });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function updateBooking(req, res, next) {
  try {
    assertValid(req);
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    const canUpdate =
      req.user.role === "admin" || req.user._id.toString() === booking.panditOrLama.toString();
    if (!canUpdate) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }

    booking.status = req.body.status;
    await booking.save();
    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

async function deleteBooking(req, res, next) {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, message: "Booking deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };
