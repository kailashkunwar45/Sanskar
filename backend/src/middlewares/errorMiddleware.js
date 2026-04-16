function errorMiddleware(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorMiddleware;
