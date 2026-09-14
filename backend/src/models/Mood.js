import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  mood: { type: String, default: 'neutral' },
  title: { type: String, default: '' },
  note: { type: String, default: '' },
  intensity: { type: Number, min: 1, max: 5, default: 3 },
  color: { type: String, default: '#f7a8c4' },
  emoji: { type: String, default: '' },
  category: { type: String, default: '' },
  tags: { type: [String], default: [] },
  weather: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  isFavorite: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

moodSchema.index({ coupleId: 1, date: -1 });

export default mongoose.model('Mood', moodSchema);
