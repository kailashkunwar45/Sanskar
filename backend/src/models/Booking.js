const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  panditOrLama: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

bookingSchema.index({ dateTime: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
