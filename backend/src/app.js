import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import { isOriginAllowed } from "./utils/origin.js";

const app = express();

app.set("trust proxy", 1);

const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Melodic Vault API is running",
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  void next;
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export default app;
