import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true, trim: true },
  message: { type: String, default: '' },
  type: { type: String, default: 'general' },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

notificationSchema.index({ coupleId: 1, recipient: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
