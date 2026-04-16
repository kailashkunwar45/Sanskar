const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "admin", "vendor", "pandit", "lama", "superadmin"],
    default: "customer",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    required: false,
    default: "",
  },
  specialization: {
    type: String,
    required: false,
    default: "",
  },
  religionPreference: {
    type: String,
    enum: ["hindu", "buddhist"],
    required: false,
  },
  phone: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  refreshTokenHash: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ role: 1 });

userSchema.pre("save", async function preSave() {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
