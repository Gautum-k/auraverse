import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    language: { type: String, default: 'Tamil', trim: true },
    mood: { type: String, default: '', trim: true },
    type: { type: String, default: 'Original', trim: true },
    audioUrl: { type: String },
    previewUrl: { type: String },
    coverUrl: { type: String },
    artworkUrl: { type: String },
    duration: { type: Number, default: 180 },
    durationSeconds: { type: Number, default: 180 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    album: { type: String, default: 'Single' },
    plays: { type: Number, default: 0 },
    externalId: { type: String, unique: true, sparse: true },
    source: { type: String, enum: ['itunes', 'uploaded'], default: 'uploaded' },
  },
  { timestamps: true }
);

export default mongoose.model('Track', trackSchema);

