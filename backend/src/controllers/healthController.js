function getHealth(_req, res) {
  return res.status(200).json({
    success: true,
    message: "Sanskar API is healthy",
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };
