function validateJsonContentType(req, _res, next) {
  if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) {
    const error = new Error("Content-Type must be application/json");
    error.statusCode = 415;
    return next(error);
  }

  return next();
}

module.exports = { validateJsonContentType };
