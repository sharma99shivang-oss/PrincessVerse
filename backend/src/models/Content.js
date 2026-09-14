import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['gallery', 'food', 'movie', 'music', 'letter', 'gift', 'timeline', 'bucket', 'notification'], required: true },
  image: { type: String, default: '' },
  emoji: { type: String, default: '✨' },
  accent: { type: String, default: '#f7a8c4' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  isPinned: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

contentSchema.index({ coupleId: 1, type: 1, createdAt: -1 });

export default mongoose.model('Content', contentSchema);
