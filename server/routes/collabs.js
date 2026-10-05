import express from 'express';
import Collab from '../models/Collab.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { role, genre } = req.query;
    let query = {};
    if (role && role !== 'All roles') {
      query.role = role;
    }
    if (genre && genre !== 'All genres') {
      query.genre = genre;
    }

    const collabs = await Collab.find(query)
      .populate('owner', 'name city genre hue bio looking')
      .sort({ createdAt: -1 });

    res.json(collabs);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch collab requests.' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, role, genre, bpm, description } = req.body;
    if (!title || !role || !genre || !description) {
      return res.status(400).json({ error: 'Please fill out all required collaboration fields.' });
    }

    const collab = new Collab({
      title,
      role,
      genre,
      bpm: Number(bpm) || 100,
      description,
      owner: req.user._id,
      interested: [],
    });

    await collab.save();
    await collab.populate('owner', 'name city genre hue bio looking');
    res.status(201).json(collab);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create collab request.' });
  }
});

router.post('/:id/interest', authMiddleware, async (req, res) => {
  try {
    const collab = await Collab.findById(req.params.id);
    if (!collab) {
      return res.status(404).json({ error: 'Collab request not found.' });
    }

    const index = collab.interested.indexOf(req.user._id);
    if (index > -1) {
      collab.interested.splice(index, 1);
    } else {
      collab.interested.push(req.user._id);
    }

    await collab.save();
    await collab.populate('owner', 'name city genre hue bio looking');
    res.json(collab);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to toggle interest.' });
  }
});

export default router;
