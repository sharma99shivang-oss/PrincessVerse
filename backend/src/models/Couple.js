import mongoose from 'mongoose';

const permissionsSchema = new mongoose.Schema({
  // 📸 Gallery
  canUploadPhotos: { type: Boolean, default: true },
  canDeleteOwnPhotos: { type: Boolean, default: true },
  canCommentMemories: { type: Boolean, default: true },

  canUseChat: { type: Boolean, default: true },
  // 💌 Love Letters
  canReplyLetters: { type: Boolean, default: true },
  canDeleteOwnReplies: { type: Boolean, default: true },

  // 😊 Other Features
  canAddMood: { type: Boolean, default: true },
  canAddBucketList: { type: Boolean, default: true },
  canEditOwnProfile: { type: Boolean, default: true },
  canCreatePlaylist: { type: Boolean, default: true }
}, { _id: false });

const modulesSchema = new mongoose.Schema({

  gallery: { type: Boolean, default: true },
  memories: { type: Boolean, default: true },
  letters: { type: Boolean, default: true },
  letterReplies: { type: Boolean, default: true },
  chat: { type: Boolean, default: true },
  timeline: { type: Boolean, default: true },

  gifts: { type: Boolean, default: true },
  music: { type: Boolean, default: true },
  movies: { type: Boolean, default: true },
  foods: { type: Boolean, default: true },

  moods: { type: Boolean, default: true },
  bucketList: { type: Boolean, default: true },
  calendar: { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },

  relationshipAnalytics: { type: Boolean, default: true }

}, { _id: false });

const coupleSchema = new mongoose.Schema({
  relationshipName: { type: String, required: true, trim: true },
  anniversaryDate: { type: Date },
  theme: { type: String, default: 'blush' },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permissions: { type: permissionsSchema, default: () => ({}) },

  modules: { type: modulesSchema, default: () => ({}) },

settings: {
  type: mongoose.Schema.Types.Mixed,
  default: {
    theme: "princess-pink",
    sweetReminders: true,
    notificationSound: true,
    memoriesPrivate: true,
  },
},
  inviteTokenHash: { type: String, select: false },
  inviteExpiresAt: { type: Date }
}, { timestamps: true });

coupleSchema.index({ adminUser: 1 });
coupleSchema.index({ partnerUser: 1 });

export default mongoose.model('Couple', coupleSchema);
