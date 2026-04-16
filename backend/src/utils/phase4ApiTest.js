const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const Article = require("../models/Article");
const Ritual = require("../models/Ritual");

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
    email: "admin@local.test",
    password: "AdminPass123",
    role: "admin",
  });
  const vendor = await User.create({
    name: "Vendor",
    email: "vendor@local.test",
    password: "VendorPass123",
    role: "vendor",
  });
  const customer = await User.create({
    name: "Customer",
    email: "customer@local.test",
    password: "CustomerPass123",
    role: "customer",
  });
  const pandit = await User.create({
    name: "Pandit",
    email: "pandit@local.test",
    password: "PanditPass123",
    role: "pandit",
  });

  const adminToken = signAccess(admin);
  const vendorToken = signAccess(vendor);
  const customerToken = signAccess(customer);
  const panditToken = signAccess(pandit);

  const server = app.listen(0);
  const port = server.address().port;

  // Articles
  const createArticle = await request(port, "POST", "/articles", adminToken, {
    title: "Article Title",
    content: "Article content detail",
    steps: ["step1"],
    category: "guide",
    religion: "hindu",
  });
  const articleId = createArticle.data?.data?._id;
  const getArticles = await request(port, "GET", "/articles", adminToken);
  const updateArticle = await request(port, "PUT", `/articles/${articleId}`, adminToken, {
    meaning: "Updated meaning",
  });
  const delArticle = await request(port, "DELETE", `/articles/${articleId}`, adminToken);

  // Rituals
  const createRitual = await request(port, "POST", "/rituals", adminToken, {
    title: "Ritual Title",
    steps: ["s1"],
    checklist: ["c1"],
    category: "daily",
    religion: "hindu",
  });
  const ritualId = createRitual.data?.data?._id;
  const getRituals = await request(port, "GET", "/rituals", adminToken);

  // Products
  const createProduct = await request(port, "POST", "/products", vendorToken, {
    name: "Incense Pack",
    description: "Pure incense sticks",
    price: 299,
    images: [],
    category: "pooja-item",
    stock: 20,
    vendor: vendor._id,
  });
  const productId = createProduct.data?.data?._id;
  const getProducts = await request(port, "GET", "/products?category=pooja-item", customerToken);

  // Orders
  const createOrder = await request(port, "POST", "/orders", customerToken, {
    products: [{ product: productId, quantity: 1, unitPrice: 299 }],
    totalPrice: 299,
    paymentInfo: { method: "cod", paid: false },
  });
  const orderId = createOrder.data?.data?._id;
  const adminOrders = await request(port, "GET", "/orders", adminToken);
  const updateOrder = await request(port, "PUT", `/orders/${orderId}`, adminToken, {
    status: "confirmed",
  });

  // Bookings
  const createBooking = await request(port, "POST", "/bookings", customerToken, {
    panditOrLama: pandit._id,
    dateTime: new Date(Date.now() + 3600000).toISOString(),
  });
  const bookingId = createBooking.data?.data?._id;
  const panditUpdateBooking = await request(port, "PUT", `/bookings/${bookingId}`, panditToken, {
    status: "confirmed",
  });

  // Reviews
  const createReview = await request(port, "POST", "/reviews", customerToken, {
    targetType: "Product",
    target: productId,
    rating: 5,
    comment: "Great quality",
  });
  const reviewId = createReview.data?.data?._id;
  const getReviews = await request(port, "GET", `/reviews?target=${productId}`, customerToken);
  const deleteReview = await request(port, "DELETE", `/reviews/${reviewId}`, customerToken);

  // Notifications
  const createNotification = await request(port, "POST", "/notifications", adminToken, {
    user: customer._id,
    message: "Your order is confirmed",
  });
  const myNotifications = await request(port, "GET", "/notifications", customerToken);

  // Chat
  const chatMessage = await request(port, "POST", "/chat/messages", customerToken, {
    admin: admin._id,
    text: "Namaste",
  });
  const chatList = await request(port, "GET", "/chat", adminToken);

  // Auth guard check
  const forbiddenArticleCreate = await request(port, "POST", "/articles", customerToken, {
    title: "X",
    content: "Y",
    category: "guide",
    religion: "hindu",
  });

  const counts = {
    users: await User.countDocuments(),
    products: await Product.countDocuments(),
    orders: await Order.countDocuments(),
    bookings: await Booking.countDocuments(),
    reviews: await Review.countDocuments(),
    notifications: await Notification.countDocuments(),
    chats: await Chat.countDocuments(),
    articles: await Article.countDocuments(),
    rituals: await Ritual.countDocuments(),
  };

  console.log("PHASE4_STATUS", {
    createArticle: createArticle.status,
    getArticles: getArticles.status,
    updateArticle: updateArticle.status,
    delArticle: delArticle.status,
    createRitual: createRitual.status,
    getRituals: getRituals.status,
    createProduct: createProduct.status,
    getProducts: getProducts.status,
    createOrder: createOrder.status,
    adminOrders: adminOrders.status,
    updateOrder: updateOrder.status,
    createBooking: createBooking.status,
    panditUpdateBooking: panditUpdateBooking.status,
    createReview: createReview.status,
    getReviews: getReviews.status,
    deleteReview: deleteReview.status,
    createNotification: createNotification.status,
    myNotifications: myNotifications.status,
    chatMessage: chatMessage.status,
    chatList: chatList.status,
    forbiddenArticleCreate: forbiddenArticleCreate.status,
  });
  console.log("PHASE4_COUNTS", counts);

  server.close();
  await mongoose.disconnect();
  await mongo.stop();
}

run().catch((error) => {
  console.error("PHASE4_TEST_FAILED", error);
  process.exit(1);
});
