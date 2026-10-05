import express from 'express';
import Playlist from '../models/Playlist.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate({
        path: 'trackIds',
        populate: { path: 'owner', select: 'name city genre hue' },
      })
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch playlists.' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const name = req.body.name?.trim() || 'My Playlist';
    const playlist = new Playlist({
      name,
      owner: req.user._id,
      trackIds: [],
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create playlist.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({
      path: 'trackIds',
      populate: { path: 'owner', select: 'name city genre hue' },
    });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch playlist.' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to update this playlist.' });
    }
    if (req.body.name) {
      playlist.name = req.body.name.trim();
    }
    await playlist.save();
    await playlist.populate({
      path: 'trackIds',
      populate: { path: 'owner', select: 'name city genre hue' },
    });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to rename playlist.' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this playlist.' });
    }
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist deleted.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete playlist.' });
  }
});

router.post('/:id/tracks', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to edit this playlist.' });
    }
    if (!playlist.trackIds.includes(trackId)) {
      playlist.trackIds.push(trackId);
      await playlist.save();
    }
    await playlist.populate({
      path: 'trackIds',
      populate: { path: 'owner', select: 'name city genre hue' },
    });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add track to playlist.' });
  }
});

router.delete('/:id/tracks/:trackId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to edit this playlist.' });
    }
    playlist.trackIds = playlist.trackIds.filter((t) => t.toString() !== req.params.trackId);
    await playlist.save();
    await playlist.populate({
      path: 'trackIds',
      populate: { path: 'owner', select: 'name city genre hue' },
    });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to remove track from playlist.' });
  }
});

export default router;
