const { validationResult } = require("express-validator");
const Ritual = require("../models/Ritual");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getRituals(req, res, next) {
  try {
    const { search, category, religion, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (religion) {
      filter.religion = religion;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const lim = parseInt(limit, 10);

    const [rituals, total] = await Promise.all([
      Ritual.find(filter)
        .populate("linkedProducts", "name price category")
        .skip(skip)
        .limit(lim)
        .lean(),
      Ritual.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: rituals,
      rituals,
      pagination: {
        page: parseInt(page, 10),
        limit: lim,
        total,
        pages: Math.ceil(total / lim),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getRitualById(req, res, next) {
  try {
    const ritual = await Ritual.findById(req.params.id)
      .populate("linkedProducts", "name price category")
      .lean();
    if (!ritual) {
      const error = new Error("Ritual not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: ritual });
  } catch (error) {
    return next(error);
  }
}

async function createRitual(req, res, next) {
  try {
    assertValid(req);
    const created = await Ritual.create(req.body);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function updateRitual(req, res, next) {
  try {
    assertValid(req);
    const updated = await Ritual.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      returnDocument: "after",
    });
    if (!updated) {
      const error = new Error("Ritual not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
}

async function deleteRitual(req, res, next) {
  try {
    const deleted = await Ritual.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error("Ritual not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, message: "Ritual deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getRituals, getRitualById, createRitual, updateRitual, deleteRitual };
