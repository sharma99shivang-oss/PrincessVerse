import mongoose from 'mongoose';

const smartMemorySchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  summary: { type: String, required: true, trim: true, maxlength: 5000 },
  memoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Memory' }],
  sourceFrom: { type: Date },
  sourceTo: { type: Date },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

smartMemorySchema.index({ coupleId: 1, generatedAt: -1 });
smartMemorySchema.index({ coupleId: 1, sourceFrom: 1, sourceTo: 1 });
export default mongoose.model('SmartMemory', smartMemorySchema);
