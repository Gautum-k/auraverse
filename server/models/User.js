import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    genre: { type: String, default: 'Indie Pop' },
    city: { type: String, default: 'Chennai' },
    bio: { type: String, default: '' },
    looking: { type: String, default: '' },
    followersCount: { type: Number, default: 0 },
    hue: { type: Number, default: 150 },
    isArtist: { type: Boolean, default: true },
    isCatalogArtist: { type: Boolean, default: false },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);

