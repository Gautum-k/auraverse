import express from 'express';
import User from '../models/User.js';
import Track from '../models/Track.js';
import Collab from '../models/Collab.js';
import Follow from '../models/Follow.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let query = { isArtist: true };
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [{ name: regex }, { genre: regex }, { city: regex }];
    }

    const artists = await User.find(query).select('-passwordHash').sort({ followersCount: -1 });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch artists.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const artist = await User.findById(req.params.id).select('-passwordHash');
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found.' });
    }

    const tracks = await Track.find({ owner: artist._id }).populate('owner', 'name city genre hue').sort({ plays: -1 });
    const collabs = await Collab.find({ owner: artist._id }).sort({ createdAt: -1 });

    res.json({
      artist,
      tracks,
      collabs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch artist details.' });
  }
});

router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const artistId = req.params.id;
    if (artistId === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const artist = await User.findById(artistId);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found.' });
    }

    const existing = await Follow.findOne({ follower: req.user._id, artist: artistId });
    let isFollowing = false;

    if (existing) {
      await Follow.findByIdAndDelete(existing._id);
      artist.followersCount = Math.max(0, (artist.followersCount || 0) - 1);
      isFollowing = false;
    } else {
      await Follow.create({ follower: req.user._id, artist: artistId });
      artist.followersCount = (artist.followersCount || 0) + 1;
      isFollowing = true;
    }

    await artist.save();

    res.json({
      isFollowing,
      followersCount: artist.followersCount,
      artistId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to toggle follow status.' });
  }
});

export default router;
