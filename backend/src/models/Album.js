import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  coverUrl: { type: String, default: '' },
  coverPublicId: { type: String, default: '' },
  memories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Memory' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

albumSchema.index({ coupleId: 1, createdAt: -1 });

export default mongoose.model('Album', albumSchema);
