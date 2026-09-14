import mongoose from 'mongoose';
const replySchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,
  },
  { _id: true }
);
const letterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  message: { type: String, default: '' },
  theme: { type: String, default: 'pink' },
  emoji: { type: String, default: '💌' },
  attachmentImage: { type: String, default: '' },
  attachmentMemory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory' },
  lockUntilDate: { type: Date },
  isLocked: { type: Boolean, default: false },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isRead: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  // 💬 Partner Replies
  replies: {
    type: [replySchema],
    default: [],
  },

  // ❤️ Reaction (future feature)
  reaction: {
    type: String,
    default: "",
  },
  sentAt: { type: Date, default: Date.now },
  readAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true }
}, { timestamps: true });

letterSchema.index({ coupleId: 1, createdAt: -1 });
letterSchema.index({ coupleId: 1, lockUntilDate: 1 });

export default mongoose.model('Letter', letterSchema);
