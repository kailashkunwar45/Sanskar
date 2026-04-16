const mongoose = require("mongoose");
const User = require("../src/models/User");
const Booking = require("../src/models/Booking");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing test users
    const testEmails = ["admin@test.com", "pandit@test.com", "customer@test.com"];
    await User.deleteMany({ email: { $in: testEmails } });
    console.log("Cleared existing test users");
    
    // Create Users
    const admin = await User.create({
      name: "Platform Admin",
      email: "admin@test.com",
      password: "password123", // password will be hashed by pre-save hook
      role: "admin",
      religionPreference: "hindu"
    });

    const pandit = await User.create({
      name: "Pandit Ji",
      email: "pandit@test.com",
      password: "password123",
      role: "pandit",
      religionPreference: "hindu"
    });

    const customer = await User.create({
      name: "Ram Customer",
      email: "customer@test.com",
      password: "password123",
      role: "customer",
      religionPreference: "hindu"
    });

    console.log("Users created successfully");

    // Clear existing bookings for these users
    await Booking.deleteMany({ 
      $or: [
        { user: customer._id }, 
        { panditOrLama: pandit._id }
      ] 
    });

    // Create Sample Booking
    await Booking.create([
      {
        user: customer._id,
        panditOrLama: pandit._id,
        dateTime: new Date(Date.now() + 86400000), // Tomorrow
        status: "confirmed"
      },
      {
        user: customer._id,
        panditOrLama: pandit._id,
        dateTime: new Date(Date.now() + 172800000), // Day after tomorrow
        status: "pending"
      }
    ]);

    console.log("Sample bookings created successfully");
    console.log("-----------------------------------------");
    console.log("Test Accounts:");
    console.log("Admin: admin@test.com / password123");
    console.log("Pandit: pandit@test.com / password123");
    console.log("Customer: customer@test.com / password123");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
