const mongoose = require("mongoose");

const dailyQuoteSchema = new mongoose.Schema({
  quote: { type: String, required: true, trim: true },
  author: { type: String, trim: true, default: "" },
  religion: { type: String, required: true, enum: ["hindu", "buddhist"] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DailyQuote", dailyQuoteSchema);
