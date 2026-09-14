import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, default: '', trim: true },
  title: { type: String, default: '' },
  restaurant: { type: String, default: '' },
  dish: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  image: { type: String, default: '' },
  photo: { type: String, default: '' },
  location: { type: String, default: '' },
  address: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 5 },
  visitDate: { type: Date },
  notes: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

foodSchema.index({ coupleId: 1, visitDate: -1 });

export default mongoose.model('Food', foodSchema);
