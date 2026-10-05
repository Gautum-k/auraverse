import express from 'express';
import Like from '../models/Like.js';
import Track from '../models/Track.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/:trackId', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    const existing = await Like.findOne({ user: req.user._id, track: trackId });
    let isLiked = false;

    if (existing) {
      await Like.findByIdAndDelete(existing._id);
      isLiked = false;
    } else {
      await Like.create({ user: req.user._id, track: trackId });
      isLiked = true;
    }

    res.json({ trackId, isLiked });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to toggle like.' });
  }
});

export default router;
