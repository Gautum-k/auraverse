import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import Playlist from '../models/Playlist.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../utils/mailer.js';

import { processUploadedFile } from '../utils/storage.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'auraverse-secret-key';

const avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validImgExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (validImgExts.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Profile image must be jpg, png or webp'));
    }
  },
}).single('avatar');

const avatarUploadMiddleware = (req, res, next) => {
  avatarUpload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Profile image is larger than 2 MB.' });
      }
      return res.status(400).json({ error: err.message || 'Image upload failed.' });
    }
    next();
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, genre, city, bio, looking } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      genre: genre || 'Indie Pop',
      city: city || 'Chennai',
      bio: bio || '',
      looking: looking || '',
    });
    await user.save();

    // Trigger welcome email asynchronously in the background
    sendWelcomeEmail({ name: user.name, toEmail: user.email }).catch((err) => {
      console.error(`Welcome email failed to ${user.email}:`, err.message);
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Wrong email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Wrong email or password.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const likes = await Like.find({ user: req.user._id }).select('track');
    const follows = await Follow.find({ follower: req.user._id }).select('artist');
    const playlists = await Playlist.find({ owner: req.user._id });

    res.json({
      user: req.user,
      likedTrackIds: likes.map((l) => l.track.toString()),
      followedArtistIds: follows.map((f) => f.artist.toString()),
      playlists,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch user details.' });
  }
});

router.put('/profile', authMiddleware, avatarUploadMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.genre) user.genre = req.body.genre;
    if (req.body.city) user.city = req.body.city;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.looking !== undefined) user.looking = req.body.looking;

    if (req.file) {
      if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
        const oldPath = path.join(process.cwd(), user.avatarUrl);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {}
        }
      }
      user.avatarUrl = await processUploadedFile(req.file, 'image');
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update profile.' });
  }
});

export default router;
