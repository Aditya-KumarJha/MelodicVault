// src/server.js
import "dotenv/config";
import http from "http";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { validateEnv } from "./src/config/validateEnv.js";
import { repairAuthIndexes } from "./src/modules/auth/auth.indexes.js";
import redis from "./src/config/redis.js";
import mongoose from "mongoose";

const port = Number(process.env.PORT || 4000);

const startServer = async () => {
  validateEnv();
  await connectDB();
  await repairAuthIndexes();

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Melodic Vault API running on port ${port}`);
  });

  let isShuttingDown = false;
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log("Shutting down server");
    try {
      await redis.closeRedis?.();
      await mongoose.connection.close(false);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 3000).unref();
    } catch (error) {
      console.error("Shutdown failed:", error.message);
      process.exit(1);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
