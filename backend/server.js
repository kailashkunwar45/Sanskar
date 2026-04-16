require("dotenv").config();
const mongoose = require("mongoose");

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  process.exit(1);
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Error:", error);
  }
}

startServer();
