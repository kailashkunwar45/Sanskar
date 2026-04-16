const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["placed", "processing", "shipped", "delivered"],
    required: true,
    default: "placed",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    required: true,
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "card", "upi", "wallet", "esewa", "khalti"],
    required: true,
    default: "cod",
  },
  paymentDetails: {
    transactionId: String,
    referenceId: String,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
