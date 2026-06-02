const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, trim: true }],
  category: [{
    type: String,
    enum: ["pooja-item", "statue", "clothing", "book", "accessory", "other"],
  }],
  culturalCategory: [{
    type: String,
    enum: ["hindu", "buddhist"],
  }],
  ritualCategory: [{
    type: String,
    enum: ["festival", "daily", "ceremony", "wedding", "funeral", "other"],
  }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 1, category: 1 });
productSchema.index({ culturalCategory: 1 });
productSchema.index({ ritualCategory: 1 });

module.exports = mongoose.model("Product", productSchema);
