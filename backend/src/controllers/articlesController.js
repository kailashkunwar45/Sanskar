const { validationResult } = require("express-validator");
const Article = require("../models/Article");

function assertValid(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors.array();
    throw error;
  }
}

async function getArticles(_req, res, next) {
  try {
    const articles = await Article.find()
      .populate("linkedProducts", "name price category")
      .lean();
    return res.status(200).json({ success: true, data: articles });
  } catch (error) {
    return next(error);
  }
}

async function getArticleById(req, res, next) {
  try {
    const article = await Article.findById(req.params.id)
      .populate("linkedProducts", "name price category")
      .lean();
    if (!article) {
      const error = new Error("Article not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: article });
  } catch (error) {
    return next(error);
  }
}

async function createArticle(req, res, next) {
  try {
    assertValid(req);
    const created = await Article.create(req.body);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return next(error);
  }
}

async function updateArticle(req, res, next) {
  try {
    assertValid(req);
    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      returnDocument: "after",
    });
    if (!updated) {
      const error = new Error("Article not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
}

async function deleteArticle(req, res, next) {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const error = new Error("Article not found");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ success: true, message: "Article deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getArticles, getArticleById, createArticle, updateArticle, deleteArticle };
