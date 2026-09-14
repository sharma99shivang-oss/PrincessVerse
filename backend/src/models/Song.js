import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, default: '' },
  album: { type: String, default: '' },
  category: { type: String, default: '' },
  genre: { type: String, default: '' },
  url: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  spotifyUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  duration: { type: Number, min: 0 },
  isFavorite: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

songSchema.index({ coupleId: 1, createdAt: -1 });

export default mongoose.model('Song', songSchema);
