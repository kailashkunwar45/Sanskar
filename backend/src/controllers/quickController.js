const Ritual = require("../models/Ritual");
const Product = require("../models/Product");
const User = require("../models/User");

async function getQuickRituals(_req, res, next) {
  try {
    const categories = await Ritual.distinct("category");
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return next(error);
  }
}

async function getQuickProducts(_req, res, next) {
  try {
    const categories = await Product.distinct("category");
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return next(error);
  }
}

async function getQuickBookings(_req, res, next) {
  try {
    const profiles = await User.find({ role: { $in: ["pandit"] } })
      .select("name role religionPreference")
      .lean();
    return res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getQuickRituals, getQuickProducts, getQuickBookings };
