const { validationResult } = require("express-validator");
const Chat = require("../models/Chat");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getChats(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const chats = await Chat.find(filter)
      .populate("user", "name role")
      .populate("admin", "name role")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    return next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    assertValid(req);
    const { user, admin, text } = req.body;
    const userId = req.user.role === "admin" ? user : req.user._id;
    const adminId = req.user.role === "admin" ? req.user._id : admin;

    let chat = await Chat.findOne({ user: userId, admin: adminId });
    if (!chat) {
      chat = await Chat.create({ user: userId, admin: adminId, messages: [] });
    }

    chat.messages.push({ sender: req.user._id, text });
    await chat.save();
    return res.status(201).json({ success: true, data: chat });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getChats, sendMessage };
