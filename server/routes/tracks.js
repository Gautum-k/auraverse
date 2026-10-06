import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Track from '../models/Track.js';
import Like from '../models/Like.js';
import Playlist from '../models/Playlist.js';
import { authMiddleware } from '../middleware/auth.js';

import { processUploadedFile } from '../utils/storage.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
const audioDir = path.join(uploadDir, 'audio');
const coversDir = path.join(uploadDir, 'covers');


[uploadDir, audioDir, coversDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioDir);
    } else if (file.fieldname === 'cover') {
      cb(null, coversDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    const validAudioExts = ['.mp3', '.m4a', '.wav'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      validAudioExts.includes(ext) ||
      file.mimetype.includes('mpeg') ||
      file.mimetype.includes('wav') ||
      file.mimetype.includes('mp4') ||
      file.mimetype.includes('aac') ||
      file.mimetype.includes('audio')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Audio must be mp3, m4a or wav'));
    }
  } else if (file.fieldname === 'cover') {
    const validImgExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (validImgExts.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Cover must be jpg, png or webp'));
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter,
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is larger than 20 MB.' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        if (req.files.audio[0].size > 20 * 1024 * 1024) {
          return res.status(400).json({ error: 'File is larger than 20 MB.' });
        }
      }
      if (req.files.cover && req.files.cover[0]) {
        if (req.files.cover[0].size > 3 * 1024 * 1024) {
          return res.status(400).json({ error: 'Cover image is larger than 3 MB.' });
        }
      }
    }
    next();
  });
};

router.get('/', async (req, res) => {
  try {
    const { q, genre, language, mood, type, artistId, source } = req.query;
    let query = {};

    if (genre && genre !== 'All') {
      query.genre = new RegExp(`^${genre}$`, 'i');
    }
    if (language && language !== 'All') {
      query.language = new RegExp(`^${language}$`, 'i');
    }
    if (mood && mood !== 'All') {
      query.mood = new RegExp(`^${mood}$`, 'i');
    }
    if (type && type !== 'All') {
      query.type = new RegExp(`^${type}$`, 'i');
    }
    if (artistId) {
      query.owner = artistId;
    }
    if (source) {
      query.source = source;
    }

    let tracks = await Track.find(query).populate('owner', 'name city genre hue avatarUrl').sort({ createdAt: -1 });

    if (q) {
      const regex = new RegExp(q, 'i');
      tracks = tracks.filter(
        (t) =>
          regex.test(t.title) ||
          regex.test(t.genre) ||
          regex.test(t.language) ||
          regex.test(t.mood || '') ||
          regex.test(t.type || '') ||
          regex.test(t.owner?.name || '')
      );
    }

    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch tracks.' });
  }
});

router.post('/', authMiddleware, uploadMiddleware, async (req, res) => {
  try {
    const { title, genre, language, mood, type, duration, album } = req.body;
    if (!title || !genre || !language || !type) {
      return res.status(400).json({ error: 'Please provide title, genre, language, and type.' });
    }

    const audioFile = req.files && req.files.audio ? req.files.audio[0] : null;
    if (!audioFile) {
      return res.status(400).json({ error: 'Please select an audio file to upload.' });
    }

    const audioUrl = await processUploadedFile(audioFile, 'audio');
    const coverFile = req.files && req.files.cover ? req.files.cover[0] : null;
    const coverUrl = coverFile ? await processUploadedFile(coverFile, 'image') : '';

    const dur = Number(duration) || 180;


    const track = new Track({
      title,
      genre,
      language: language || 'Tamil',
      mood: mood || '',
      type: type || 'Original',
      audioUrl,
      coverUrl,
      artworkUrl: coverUrl,
      duration: dur,
      durationSeconds: dur,
      album: album || 'Single',
      owner: req.user._id,
      source: 'uploaded',
      plays: 0,
    });

    await track.save();
    await track.populate('owner', 'name city genre hue avatarUrl');
    res.status(201).json(track);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Track upload failed.' });
  }
});

router.put('/:id', authMiddleware, uploadMiddleware, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }
    if (track.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to edit this track.' });
    }

    if (req.body.title) track.title = req.body.title;
    if (req.body.genre) track.genre = req.body.genre;
    if (req.body.language) track.language = req.body.language;
    if (req.body.mood !== undefined) track.mood = req.body.mood;
    if (req.body.type) track.type = req.body.type;
    if (req.body.album) track.album = req.body.album;

    const coverFile = req.files && req.files.cover ? req.files.cover[0] : null;
    if (coverFile) {
      const existingCover = track.coverUrl || track.artworkUrl;
      if (existingCover && existingCover.startsWith('/uploads/covers/')) {
        const oldPath = path.join(process.cwd(), existingCover);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {}
        }
      }
      const newCoverUrl = await processUploadedFile(coverFile, 'image');
      track.coverUrl = newCoverUrl;
      track.artworkUrl = newCoverUrl;
    }

    await track.save();
    await track.populate('owner', 'name city genre hue avatarUrl');
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update track.' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }
    if (track.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this track.' });
    }

    if (track.audioUrl && track.audioUrl.startsWith('/uploads/')) {
      const audioPath = path.join(process.cwd(), track.audioUrl);
      if (fs.existsSync(audioPath)) {
        try {
          fs.unlinkSync(audioPath);
        } catch (e) {}
      }
    }
    const coverPath = track.coverUrl || track.artworkUrl;
    if (coverPath && coverPath.startsWith('/uploads/')) {
      const fullCoverPath = path.join(process.cwd(), coverPath);
      if (fs.existsSync(fullCoverPath)) {
        try {
          fs.unlinkSync(fullCoverPath);
        } catch (e) {}
      }
    }

    await Track.findByIdAndDelete(req.params.id);
    await Like.deleteMany({ track: req.params.id });
    await Playlist.updateMany({ trackIds: req.params.id }, { $pull: { trackIds: req.params.id } });

    res.json({ message: 'Track deleted successfully.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete track.' });
  }
});

router.post('/:id/play', async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
    res.json({ success: true, plays: track ? track.plays : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
