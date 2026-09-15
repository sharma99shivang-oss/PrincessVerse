import 'dotenv/config';
import path from "path";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import coupleRoutes from './routes/coupleRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { memoryRoutes, albumRoutes, letterRoutes, timelineRoutes, commentRoutes } from './routes/phase3Routes.js';
import { giftRoutes, songRoutes, movieRoutes, foodRoutes, moodRoutes, bucketListRoutes, phase4DashboardRoutes } from './routes/phase4Routes.js';
import { permissions, notifications, searchRoutes, settings, activity, invite } from './routes/phase5Routes.js';
import { analytics, achievements, smartMemories } from './routes/phase6Routes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many authentication requests. Please try again later.' } }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'princessverse-api', timestamp: new Date().toISOString() }));


app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/couples', coupleRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/letters', letterRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/bucket-list', bucketListRoutes);
app.use('/api/dashboard', phase4DashboardRoutes);
app.use('/api/permissions', permissions);
app.use('/api/notifications', notifications);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settings);
app.use('/api/activity', activity);
app.use('/api/couples/invite', invite);
app.use('/api/analytics', analytics);
app.use('/api/achievements', achievements);
app.use('/api/smart-memories', smartMemories);
app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => app.listen(port, () => console.log(`PrincessVerse API listening on port ${port}`)))
  .catch((error) => {
    console.error('Unable to start API:', error.message);
    process.exit(1);
  });

export default app;
