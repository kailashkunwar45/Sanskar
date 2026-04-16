const { validationResult } = require("express-validator");
const Notification = require("../models/Notification");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function sendNotification(req, res, next) {
  try {
    assertValid(req);
    const created = await Notification.create(req.body);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function getMyNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return next(error);
  }
}

module.exports = { sendNotification, getMyNotifications };
