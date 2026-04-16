const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  steps: [{ type: String, trim: true }],
  meaning: { type: String, trim: true, default: "" },
  requiredItems: [{ type: String, trim: true }],
  linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  category: {
    type: String,
    required: true,
    enum: ["guide", "history", "festival", "mantra", "wellness", "other"],
  },
  religion: { type: String, required: true, enum: ["hindu", "buddhist"] },
  images: [{ type: String, trim: true }],
});

articleSchema.index({ category: 1, religion: 1 });

module.exports = mongoose.model("Article", articleSchema);
