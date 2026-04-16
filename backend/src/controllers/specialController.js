const { validationResult } = require("express-validator");
const Festival = require("../models/Festival");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

function dayRange(dateInput) {
  const start = new Date(dateInput);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function getTodaySpecial(req, res, next) {
  try {
    const religion = req.query.religion;
    const { start, end } = dayRange(new Date());
    const filter = { date: { $gte: start, $lt: end } };
    if (religion) filter.religion = religion;

    const events = await Festival.find(filter).sort({ date: 1 }).lean();
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return next(error);
  }
}

async function getSpecialByDate(req, res, next) {
  try {
    const { start, end } = dayRange(req.params.date);
    const religion = req.query.religion;
    const filter = { date: { $gte: start, $lt: end } };
    if (religion) filter.religion = religion;

    const events = await Festival.find(filter).sort({ date: 1 }).lean();
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    return next(error);
  }
}

async function createSpecial(req, res, next) {
  try {
    assertValid(req);
    const created = await Festival.create(req.body);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function updateSpecial(req, res, next) {
  try {
    assertValid(req);
    const updated = await Festival.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      returnDocument: "after",
    });
    if (!updated) {
      const error = new Error("Special event not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
}

async function deleteSpecial(req, res, next) {
  try {
    const deleted = await Festival.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error("Special event not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, message: "Special event deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTodaySpecial,
  getSpecialByDate,
  createSpecial,
  updateSpecial,
  deleteSpecial,
};
