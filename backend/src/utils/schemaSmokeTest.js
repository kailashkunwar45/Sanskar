const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const User = require("../models/User");
const Product = require("../models/Product");
const Ritual = require("../models/Ritual");
const Article = require("../models/Article");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const Festival = require("../models/Festival");
const DailyQuote = require("../models/DailyQuote");

async function run() {
  const memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@sanskar.test",
    password: "AdminPass123",
    role: "admin",
    religionPreference: "hindu",
  });
  const customer = await User.create({
    name: "Customer User",
    email: "customer@sanskar.test",
    password: "CustomerPass123",
    role: "customer",
    religionPreference: "buddhist",
  });
  const pandit = await User.create({
    name: "Pandit User",
    email: "pandit@sanskar.test",
    password: "PanditPass123",
    role: "pandit",
    religionPreference: "hindu",
  });

  const product = await Product.create({
    name: "Pooja Diya",
    description: "Traditional diya for rituals",
    price: 199,
    images: ["https://example.com/diya.png"],
    category: "pooja-item",
    stock: 50,
    vendor: admin._id,
  });

  const ritual = await Ritual.create({
    title: "Morning Pooja",
    steps: ["Clean area", "Light diya", "Offer flowers"],
    checklist: ["Diya", "Incense", "Flowers"],
    meaning: "Brings peace and devotion",
    requiredItems: ["Diya", "Agarbatti"],
    linkedProducts: [product._id],
    category: "daily",
    religion: "hindu",
  });

  const article = await Article.create({
    title: "How to Perform Morning Pooja",
    content: "A complete guide for daily pooja.",
    steps: ["Prepare altar", "Chant mantra"],
    meaning: "Daily connection with spirituality",
    requiredItems: ["Bell", "Lamp"],
    linkedProducts: [product._id],
    category: "guide",
    religion: "hindu",
  });

  const order = await Order.create({
    user: customer._id,
    products: [{ product: product._id, quantity: 2, unitPrice: 199 }],
    totalPrice: 398,
    status: "pending",
    paymentInfo: { method: "cod", transactionId: "", paid: false },
  });

  const booking = await Booking.create({
    panditOrLama: pandit._id,
    user: customer._id,
    dateTime: new Date(Date.now() + 86400000),
    status: "confirmed",
  });

  const review = await Review.create({
    user: customer._id,
    targetType: "Product",
    target: product._id,
    rating: 5,
    comment: "Very good quality",
  });

  const notification = await Notification.create({
    user: customer._id,
    message: "Your booking is confirmed",
    read: false,
  });

  const chat = await Chat.create({
    user: customer._id,
    admin: admin._id,
    messages: [{ sender: admin._id, text: "Namaste, how can I help?" }],
  });

  const festival = await Festival.create({
    title: "Buddha Jayanti",
    date: new Date("2026-05-23"),
    description: "Celebration of Lord Buddha",
    religion: "buddhist",
  });

  const quote = await DailyQuote.create({
    quote: "Peace comes from within.",
    author: "Buddha",
    religion: "buddhist",
  });

  await Product.findByIdAndUpdate(product._id, { stock: 40 });
  await Ritual.findByIdAndUpdate(ritual._id, { $push: { checklist: "Camphor" } });
  await Notification.findByIdAndUpdate(notification._id, { read: true });
  await DailyQuote.findByIdAndDelete(quote._id);

  const populatedOrder = await Order.findById(order._id)
    .populate("user", "name role")
    .populate("products.product", "name category");
  const populatedRitual = await Ritual.findById(ritual._id).populate("linkedProducts", "name");

  const indexes = {
    user: await User.collection.indexes(),
    product: await Product.collection.indexes(),
    ritual: await Ritual.collection.indexes(),
    article: await Article.collection.indexes(),
    order: await Order.collection.indexes(),
    booking: await Booking.collection.indexes(),
    review: await Review.collection.indexes(),
    festival: await Festival.collection.indexes(),
  };

  console.log("CRUD OK", {
    users: await User.countDocuments(),
    products: await Product.countDocuments(),
    rituals: await Ritual.countDocuments(),
    articles: await Article.countDocuments(),
    orders: await Order.countDocuments(),
    bookings: await Booking.countDocuments(),
    reviews: await Review.countDocuments(),
    notifications: await Notification.countDocuments(),
    chats: await Chat.countDocuments(),
    festivals: await Festival.countDocuments(),
    quotes: await DailyQuote.countDocuments(),
  });
  console.log("Populate OK", {
    orderUser: populatedOrder.user.name,
    orderedProduct: populatedOrder.products[0].product.name,
    ritualProduct: populatedRitual.linkedProducts[0].name,
  });
  console.log("Indexes OK", {
    user: indexes.user.map((x) => x.name),
    product: indexes.product.map((x) => x.name),
    ritual: indexes.ritual.map((x) => x.name),
    article: indexes.article.map((x) => x.name),
    order: indexes.order.map((x) => x.name),
    booking: indexes.booking.map((x) => x.name),
    review: indexes.review.map((x) => x.name),
    festival: indexes.festival.map((x) => x.name),
  });

  await mongoose.disconnect();
  await memoryServer.stop();
}

run().catch((error) => {
  console.error("Schema smoke test failed:", error);
  process.exit(1);
});
