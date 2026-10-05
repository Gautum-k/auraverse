import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  },
  { timestamps: true }
);

export default mongoose.model('Playlist', playlistSchema);
