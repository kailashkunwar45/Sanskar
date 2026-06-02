const mongoose = require("mongoose");

const festivalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, required: true, trim: true },
  religion: { type: String, required: false, enum: ["hindu", "buddhist", "general", "national"], default: "general" },
  image: { type: String, trim: true, default: "" },
});

festivalSchema.index({ date: 1 });

module.exports = mongoose.model("Festival", festivalSchema);
