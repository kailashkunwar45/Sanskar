const { validationResult } = require("express-validator");
const DailyQuote = require("../models/DailyQuote");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getDailyQuotes(_req, res, next) {
  try {
    const quotes = await DailyQuote.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: quotes });
  } catch (error) {
    return next(error);
  }
}

async function getTodayQuote(req, res, next) {
  try {
    const { religion } = req.query;
    const filter = religion ? { religion } : {};
    const quotes = await DailyQuote.find(filter).sort({ createdAt: -1 }).lean();
    if (!quotes.length) {
      return res.status(404).json({ success: false, message: "No quote found for today" });
    }

    const daySeed = new Date().getDate();
    const selected = quotes[daySeed % quotes.length];
    return res.status(200).json({ success: true, data: selected });
  } catch (error) {
    return next(error);
  }
}

async function createDailyQuote(req, res, next) {
  try {
    assertValid(req);
    const created = await DailyQuote.create(req.body);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function updateDailyQuote(req, res, next) {
  try {
    assertValid(req);
    const updated = await DailyQuote.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      returnDocument: "after",
    });
    if (!updated) {
      const error = new Error("Quote not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
}

async function deleteDailyQuote(req, res, next) {
  try {
    const deleted = await DailyQuote.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error("Quote not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, message: "Quote deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDailyQuotes,
  getTodayQuote,
  createDailyQuote,
  updateDailyQuote,
  deleteDailyQuote,
};
