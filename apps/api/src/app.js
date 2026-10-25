import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { getRedisClient } from "./config/redis.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());

const allowedOrigins = new Set(
  (
    process.env.WEB_ORIGINS ||
    "http://localhost:5173,http://localhost:5174"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600
  })
);

app.use(express.json({ limit: "64kb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later."
    }
  })
);

app.get("/health", (_req, res) => {
  const mongoHealthy = mongoose.connection.readyState === 1;

  let redisHealthy;

try {
  redisHealthy = getRedisClient().isReady;
} catch {
  redisHealthy = false;
}
  const healthy = mongoHealthy && redisHealthy;

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "unavailable",
    service: "bravo-api",
    dependencies: {
      mongodb: mongoHealthy ? "connected" : "disconnected",
      redis: redisHealthy ? "connected" : "disconnected"
    }
  });
});

app.use((_req, res) => {
  return res.status(404).json({
    error: "Route not found"
  });
});

app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body too large"
    });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON body"
    });
  }

  console.error("API request error:", err.message);

  return res.status(500).json({
    error: "Internal server error"
  });
});

export default app;