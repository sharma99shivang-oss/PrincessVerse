import mongoose from 'mongoose';

const bucketListSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  image: { type: String, default: '' },
  targetDate: { type: Date },
  completed: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  priority: { type: String, default: 'normal' },
  isFavorite: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

bucketListSchema.index({ coupleId: 1, targetDate: 1 });
bucketListSchema.index({ coupleId: 1, createdAt: -1 });

export default mongoose.model('BucketList', bucketListSchema);
