import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  memoryDate: { type: Date },
  location: { type: String, default: '' },
  images: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  imagePublicIds: { type: [String], default: [] },
  videoPublicIds: { type: [String], default: [] },
  mediaUrl: { type: String, default: '' },
  mediaPublicId: { type: String, default: '' },
  mediaResourceType: { type: String, enum: ['image', 'video'], default: 'image' },
  tags: { type: [String], default: [] },
  isFavorite: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  visibility: { type: String, enum: ['VISIBLE', 'PRIVATE', 'FUTURE'], default: 'VISIBLE' },
  futureRevealDate: { type: Date },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

memorySchema.index({ coupleId: 1, createdAt: -1 });
memorySchema.index({ coupleId: 1, memoryDate: -1 });

export default mongoose.model('Memory', memorySchema);
