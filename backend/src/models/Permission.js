import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, unique: true, index: true },
  values: { type: Map, of: Boolean, default: {} }
}, { timestamps: true });

permissionSchema.index({ coupleId: 1, updatedAt: -1 });

export default mongoose.model('Permission', permissionSchema);
