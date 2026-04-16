const { validationResult } = require("express-validator");
const Product = require("../models/Product");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getProducts(req, res, next) {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("vendor", "name email role")
      .lean();
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate("vendor", "name email role")
      .lean();
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    assertValid(req);
    const body = { ...req.body };
    if (!body.vendor) body.vendor = req.user._id;
    const created = await Product.create(body);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    assertValid(req);
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      returnDocument: "after",
    });
    if (!updated) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
