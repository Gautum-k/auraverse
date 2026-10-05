import mongoose from 'mongoose';

const collabSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    bpm: { type: Number, default: 100 },
    description: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    interested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('Collab', collabSchema);
