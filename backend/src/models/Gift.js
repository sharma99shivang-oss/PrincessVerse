import mongoose from 'mongoose';

const giftSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  image: { type: String, default: '' },
  giftImage: { type: String, default: '' },
  price: { type: Number, min: 0 },
  budget: { type: Number, min: 0 },
  link: { type: String, default: '' },
  shoppingLink: { type: String, default: '' },
  recipient: { type: String, default: '' },
  giftType: { type: String, default: '' },
  revealDate: { type: Date },
  status: { type: String, default: 'planned' },
  giftStatus: { type: String, default: 'Planned' },
  isRevealed: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

giftSchema.index({ coupleId: 1, revealDate: 1 });
giftSchema.index({ coupleId: 1, createdAt: -1 });

export default mongoose.model('Gift', giftSchema);
