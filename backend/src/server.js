import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";

import { connectDB } from "./config/db.js";
import { initSocket } from "./socket/socket.js";

import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import coupleRoutes from "./routes/coupleRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import {
  memoryRoutes,
  albumRoutes,
  letterRoutes,
  timelineRoutes,
  commentRoutes,
} from "./routes/phase3Routes.js";

import {
  giftRoutes,
  songRoutes,
  movieRoutes,
  foodRoutes,
  moodRoutes,
  bucketListRoutes,
  phase4DashboardRoutes,
} from "./routes/phase4Routes.js";

import {
  permissions,
  notifications,
  searchRoutes,
  settings,
  activity,
  invite,
} from "./routes/phase5Routes.js";

import {
  analytics,
  achievements,
  smartMemories,
} from "./routes/phase6Routes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

/* ================= SECURITY ================= */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ================= CORS ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://princess-verse-frontend-1y4g.vercel.app",
];

// Agar .env me CLIENT_URL hai to usko bhi add kar do
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((origin) => {
    const value = origin.trim();
    if (value && !allowedOrigins.includes(value)) {
      allowedOrigins.push(value);
    }
  });
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked Origin:", origin);
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

/* ================= HEALTH ================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "princessverse-api",
    socket: "running",
    timestamp: new Date().toISOString(),
  });
});

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/couples", coupleRoutes);

app.use("/api/memories", memoryRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/comments", commentRoutes);

app.use("/api/gifts", giftRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/bucket-list", bucketListRoutes);
app.use("/api/dashboard", phase4DashboardRoutes);

app.use("/api/permissions", permissions);
app.use("/api/notifications", notifications);
app.use("/api/search", searchRoutes);
app.use("/api/settings", settings);
app.use("/api/activity", activity);
app.use("/api/couples/invite", invite);

app.use("/api/analytics", analytics);
app.use("/api/achievements", achievements);
app.use("/api/smart-memories", smartMemories);

app.use("/api/chat", chatRoutes);

/* ================= ERRORS ================= */

app.use(notFound);
app.use(errorHandler);

/* ================= START SERVER ================= */

connectDB()
  .then(() => {
  initSocket(server, allowedOrigins);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 PrincessVerse API listening on port ${PORT}`);
      console.log("💖 Socket.IO Ready");
      console.log("🌐 Allowed Origins:", allowedOrigins);
    });
  })
  .catch((err) => {
    console.error("❌ Unable to start API:", err.message);
    process.exit(1);
  });

export default app;