const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  backendUrl: process.env.BACKEND_URL || "http://localhost:4000",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/melodic-vault",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
  },
  get isDev() {
    return this.nodeEnv === "development";
  },
  get isProd() {
    return this.nodeEnv === "production";
  },
  get isTest() {
    return this.nodeEnv === "test";
  },
};

export default config;
