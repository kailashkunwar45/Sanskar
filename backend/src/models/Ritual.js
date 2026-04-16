const mongoose = require("mongoose");

const ritualSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    steps: [{ type: String, trim: true }],
    checklist: [{ type: String, trim: true }],
    meaning: { type: String, trim: true, default: "" },
    requiredItems: [{ type: String, trim: true }],
    linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    category: {
      type: String,
      required: true,
      enum: ["festival", "daily", "ceremony", "wedding", "funeral", "other"],
    },
    religion: { type: String, required: true, enum: ["hindu", "buddhist"] },
    images: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

ritualSchema.index({ category: 1, religion: 1 });
ritualSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Ritual", ritualSchema);
