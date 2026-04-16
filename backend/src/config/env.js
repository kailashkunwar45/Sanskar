function getEnvConfig() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,
    mongoUri,
    clientOrigin: process.env.CLIENT_ORIGIN || "*",
    streamApiKey: process.env.STREAM_API_KEY || "",
    streamApiSecret: process.env.STREAM_API_SECRET || "",
    jwtSecret: process.env.JWT_SECRET || "",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };

  if (!env.mongoUri) {
    throw new Error("Missing required env variable: MONGO_URI (or MONGODB_URI)");
  }

  return env;
}

module.exports = { getEnvConfig };
