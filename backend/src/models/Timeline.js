import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  eventDate: { type: Date, required: true },
  date: { type: Date },
  location: { type: String, default: '' },
  emoji: { type: String, default: '♥' },
  colorTheme: { type: String, default: 'rose' },
  mediaUrl: { type: String, default: '' },
  mediaPublicId: { type: String, default: '' },
  mediaResourceType: { type: String, enum: ['image', 'video'], default: 'image' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

timelineSchema.index({ coupleId: 1, eventDate: -1 });

export default mongoose.model('Timeline', timelineSchema);
