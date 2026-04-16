require("dotenv").config();

const { createApp } = require("./app");
const { getEnvConfig } = require("./config/env");
const { connectDatabase } = require("./config/db");

async function bootstrap() {
  const config = getEnvConfig();
  await connectDatabase(config.mongoUri);

  const app = createApp(config);
  app.listen(config.port, () => {
    console.log(`Sanskar API running on port ${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
