const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/User");
const DailyQuote = require("../models/DailyQuote");
const Festival = require("../models/Festival");
const Ritual = require("../models/Ritual");
const Product = require("../models/Product");

function signAccess(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );
}

async function request(port, method, path, token, body) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
  process.env.REFRESH_SECRET = process.env.REFRESH_SECRET || "test_refresh_secret";

  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  const admin = await User.create({
    name: "Admin",
    email: "admin5@local.test",
    password: "AdminPass123",
    role: "admin",
  });
  const customer = await User.create({
    name: "Customer",
    email: "customer5@local.test",
    password: "CustomerPass123",
    role: "customer",
  });
  const pandit = await User.create({
    name: "Pandit",
    email: "pandit5@local.test",
    password: "PanditPass123",
    role: "pandit",
    religionPreference: "hindu",
  });

  await Ritual.create({
    title: "Morning Ritual",
    steps: ["A", "B"],
    checklist: ["C"],
    category: "daily",
    religion: "hindu",
  });
  await Product.create({
    name: "Prayer Mala",
    description: "Wooden mala",
    price: 499,
    images: [],
    category: "accessory",
    stock: 10,
    vendor: admin._id,
  });

  const adminToken = signAccess(admin);
  const customerToken = signAccess(customer);

  const server = app.listen(0);
  const port = server.address().port;

  // Daily quote CRUD + today
  const createQuote = await request(port, "POST", "/daily-quotes", adminToken, {
    quote: "Be calm and mindful",
    author: "Guru",
    religion: "hindu",
  });
  const quoteId = createQuote.data?.data?._id;
  const getQuotes = await request(port, "GET", "/daily-quotes", customerToken);
  const todayQuote = await request(port, "GET", "/daily-quotes/today?religion=hindu", customerToken);
  const updateQuote = await request(port, "PUT", `/daily-quotes/${quoteId}`, adminToken, {
    author: "Acharya",
  });
  const deleteQuote = await request(port, "DELETE", `/daily-quotes/${quoteId}`, adminToken);

  // Today special CRUD + date query
  const todayIso = new Date().toISOString();
  const createSpecial = await request(port, "POST", "/special", adminToken, {
    title: "Hanuman Jayanti",
    date: todayIso,
    description: "Auspicious day",
    religion: "hindu",
  });
  const specialId = createSpecial.data?.data?._id;
  const getTodaySpecial = await request(port, "GET", "/today-special?religion=hindu", customerToken);
  const dateOnly = new Date().toISOString().slice(0, 10);
  const getSpecialByDate = await request(port, "GET", `/special/${dateOnly}?religion=hindu`, customerToken);
  const updateSpecial = await request(port, "PUT", `/special/${specialId}`, adminToken, {
    description: "Updated desc",
  });
  const deleteSpecial = await request(port, "DELETE", `/special/${specialId}`, adminToken);

  // Quick data
  const quickRituals = await request(port, "GET", "/quick/rituals", customerToken);
  const quickProducts = await request(port, "GET", "/quick/products", customerToken);
  const quickBookings = await request(port, "GET", "/quick/bookings", customerToken);

  // Regression checks
  const rootCheck = await fetch(`http://127.0.0.1:${port}/`);
  const authGuardCheck = await request(port, "POST", "/daily-quotes", customerToken, {
    quote: "Not allowed",
    author: "X",
    religion: "hindu",
  });

  console.log("PHASE5_STATUS", {
    createQuote: createQuote.status,
    getQuotes: getQuotes.status,
    todayQuote: todayQuote.status,
    updateQuote: updateQuote.status,
    deleteQuote: deleteQuote.status,
    createSpecial: createSpecial.status,
    getTodaySpecial: getTodaySpecial.status,
    getSpecialByDate: getSpecialByDate.status,
    updateSpecial: updateSpecial.status,
    deleteSpecial: deleteSpecial.status,
    quickRituals: quickRituals.status,
    quickProducts: quickProducts.status,
    quickBookings: quickBookings.status,
    rootCheck: rootCheck.status,
    authGuardCheck: authGuardCheck.status,
  });
  console.log("PHASE5_COUNTS", {
    users: await User.countDocuments(),
    quotes: await DailyQuote.countDocuments(),
    specials: await Festival.countDocuments(),
  });
  console.log("PHASE5_SAMPLE", {
    ritualsCategories: quickRituals.data?.data,
    productCategories: quickProducts.data?.data,
    bookingProfiles: quickBookings.data?.data?.map((x) => ({ id: x._id, role: x.role })),
  });

  server.close();
  await mongoose.disconnect();
  await mongo.stop();
}

run().catch((error) => {
  console.error("PHASE5_TEST_FAILED", error);
  process.exit(1);
});
