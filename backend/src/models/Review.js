const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["Product", "Ritual"], required: true },
  target: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "targetType" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, default: "" },
  createdAt: { type: Date, default: Date.now },
});

reviewSchema.index({ target: 1, user: 1 });

module.exports = mongoose.model("Review", reviewSchema);
