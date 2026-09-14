import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true, maxlength: 2000 },
  contentType: { type: String, enum: ['Memory', 'Album', 'Letter', 'Timeline'], required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

commentSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });
commentSchema.index({ coupleId: 1, author: 1, createdAt: -1 });
export default mongoose.model('Comment', commentSchema);
