const { validationResult } = require("express-validator");
const Festival = require("../models/Festival");

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getFestivalsByMonth(req, res, next) {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ success: false, message: "Year and month required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const festivals = await Festival.find({
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    return res.status(200).json({ success: true, festivals });
  } catch (error) {
    return next(error);
  }
}

async function createFestival(req, res, next) {
  try {
    handleValidation(req);
    const { title, date, description, religion } = req.body;
    
    // Check for exact date duplicates
    const exist = await Festival.findOne({ title, date: new Date(date) });
    if (exist) {
      return res.status(400).json({ success: false, message: "Festival already exists on this date" });
    }

    const festival = await Festival.create({ title, date, description, religion });
    return res.status(201).json({ success: true, festival });
  } catch (error) {
    return next(error);
  }
}

async function deleteFestival(req, res, next) {
  try {
    const { id } = req.params;
    const festival = await Festival.findByIdAndDelete(id);
    if (!festival) {
      return res.status(404).json({ success: false, message: "Festival not found" });
    }
    return res.status(200).json({ success: true, message: "Festival deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getFestivalsByMonth, createFestival, deleteFestival };
