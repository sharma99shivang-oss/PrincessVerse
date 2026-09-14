import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, unique: true, match: /^[6-9]\d{9}$/ },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['ADMIN', 'PARTNER'], default: 'ADMIN' },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple' },
  isFirstLogin: { type: Boolean, default: false },
  temporaryPassword: { type: Boolean, default: false },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80' },
  bio: { type: String, default: 'Making ordinary days feel like fairy tales.' },
  favoriteColor: { type: String, default: '#f7a8c4' },
  coverPhoto: { type: String, default: '' },
  nickname: { type: String, default: '' },
  relationshipQuote: { type: String, default: '' },
  birthday: { type: Date },
  instagramUsername: { type: String, default: '' },
  loveLanguage: { type: String, default: '' },
  location: { type: String, default: '' },
  favoriteSong: { type: String, default: '' },
  favoriteFood: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
  refreshTokens: { type: [String], select: false }
}, { timestamps: true });

userSchema.index({ coupleId: 1, role: 1 });

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
