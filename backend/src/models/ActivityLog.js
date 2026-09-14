import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, trim: true },
  entityType: { type: String, default: '' },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

activityLogSchema.index({ coupleId: 1, createdAt: -1 });
activityLogSchema.index({ coupleId: 1, actor: 1, createdAt: -1 });
export default mongoose.model('ActivityLog', activityLogSchema);
