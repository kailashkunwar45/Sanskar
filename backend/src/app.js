const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const articlesRoutes = require("./routes/articlesRoutes");
const ritualsRoutes = require("./routes/ritualsRoutes");
const productsRoutes = require("./routes/productsRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const bookingsRoutes = require("./routes/bookingsRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const dailyQuotesRoutes = require("./routes/dailyQuotesRoutes");
const specialRoutes = require("./routes/specialRoutes");
const quickRoutes = require("./routes/quickRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const festivalsRoutes = require("./routes/festivalsRoutes");
const aiImageRoutes = require("./routes/aiImageRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
  })
);

app.get("/", (_req, res) => {
  return res.send("Sanskar API Running");
});
app.use("/api/auth", authRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/rituals", ritualsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/daily-quotes", dailyQuotesRoutes);
app.use("/api/special", specialRoutes);
app.use("/api/quick", quickRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/festivals", festivalsRoutes);
app.use("/api/ai-image", aiImageRoutes);
app.use("/api/media", mediaRoutes);

// --- FRONTEND STATIC SERVING ---
const frontendDistPath = path.join(__dirname, "../../frontend/dist");
const frontendWebBuildPath = path.join(__dirname, "../../frontend/web-build");
let activeStaticPath = null;

if (fs.existsSync(frontendDistPath)) {
  activeStaticPath = frontendDistPath;
} else if (fs.existsSync(frontendWebBuildPath)) {
  activeStaticPath = frontendWebBuildPath;
}

if (activeStaticPath) {
  app.use(express.static(activeStaticPath));
  // Client-side routing catch-all
  app.get("*", (req, res, next) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(activeStaticPath, "index.html"));
    } else {
      next();
    }
  });
}
// -------------------------------

app.use((req, _res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);

module.exports = app;
