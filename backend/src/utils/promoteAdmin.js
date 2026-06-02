require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { getEnvConfig } = require("../config/env");

async function promote(email) {
  try {
    const config = getEnvConfig();
    await mongoose.connect(config.mongoUri);
    
    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin", isVerified: true },
      { new: true }
    );
    
    if (user) {
      console.log(`Successfully promoted ${email} to admin.`);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch (error) {
    console.error("Error promoting user:", error);
  } finally {
     await mongoose.connection.close();
  }
}

const email = process.argv[2];
if (!email) {
  console.log("Please provide an email: node promoteAdmin.js <email>");
  process.exit(1);
}

promote(email);
