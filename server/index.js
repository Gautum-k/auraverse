import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import trackRoutes from './routes/tracks.js';
import playlistRoutes from './routes/playlists.js';
import collabRoutes from './routes/collabs.js';
import artistRoutes from './routes/artists.js';
import likeRoutes from './routes/likes.js';

import { getEmailMode } from './utils/mailer.js';
import { isCloudinaryEnabled } from './utils/storage.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auraverse';

// Ensure uploads folder and subfolders exist
const uploadDir = path.join(process.cwd(), 'uploads');
const audioDir = path.join(uploadDir, 'audio');
const coversDir = path.join(uploadDir, 'covers');
const avatarsDir = path.join(uploadDir, 'avatars');

[uploadDir, audioDir, coversDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or any localhost origin in dev
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/collabs', collabRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/likes', likeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Auraverse Backend API' });
});

// Serve frontend in single-server production build
const rootClientDist = path.join(process.cwd(), '..', 'client', 'dist');
const localClientDist = path.join(process.cwd(), 'client', 'dist');
const clientDist = fs.existsSync(rootClientDist)
  ? rootClientDist
  : fs.existsSync(localClientDist)
  ? localClientDist
  : null;

if (clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // 404 handler for API if no client build is served
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found.' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  });
});

// Parse database host for startup banner
const getDbHost = (uri) => {
  try {
    const match = uri.match(/mongodb(?:\+srv)?:\/\/(?:[^:]+:[^@]+@)?([^/?]+)/);
    return match ? match[1] : uri;
  } catch (e) {
    return uri;
  }
};

// Connect database and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const dbHost = getDbHost(MONGODB_URI);
    const storageMode = isCloudinaryEnabled() ? 'Cloudinary' : 'local disk';
    const emailMode = getEmailMode();

    console.log('==================================================');
    console.log('  Auraverse Server Started Successfully');
    console.log('==================================================');
    console.log(`  Database Host : ${dbHost}`);
    console.log(`  File Storage  : ${storageMode}`);
    console.log(`  Email Service : ${emailMode}`);
    console.log(`  Server URL    : http://localhost:${PORT}`);
    console.log('==================================================');

    app.listen(PORT, () => {
      console.log(`Auraverse server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB is not running. Start the MongoDB service and try again.');
    process.exit(1);
  });
