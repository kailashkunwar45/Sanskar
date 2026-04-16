const mongoose = require("mongoose");

const festivalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, trim: true, default: "" },
  religion: { type: String, required: true, enum: ["hindu", "buddhist"] },
});

festivalSchema.index({ date: 1 });

module.exports = mongoose.model("Festival", festivalSchema);
