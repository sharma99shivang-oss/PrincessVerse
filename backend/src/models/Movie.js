import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  genre: { type: String, default: '' },
  year: { type: Number, min: 1800, max: 3000 },
  posterUrl: { type: String, default: '' },
  poster: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 10 },
  review: { type: String, default: '' },
  watchDate: { type: Date },
  streamingPlatform: { type: String, default: '' },
  watched: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

movieSchema.index({ coupleId: 1, watchDate: -1 });

export default mongoose.model('Movie', movieSchema);
