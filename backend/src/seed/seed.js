import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Couple from '../models/Couple.js';
import Content from '../models/Content.js';
import Mood from '../models/Mood.js';

const images = {
  gallery: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=80',
  food: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80',
  movie: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
  music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80'
};

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to seed.');
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User.deleteMany({}), Couple.deleteMany({}), Content.deleteMany({}), Mood.deleteMany({})]);
  const admin = await User.create({ name: 'Princess Aurora', mobileNumber: '9876543210', password: 'Princess123!', role: 'ADMIN', bio: 'Dreamer, dessert critic, and collector of tiny happy moments.' });
  const partner = await User.create({ name: 'Verse Keeper', mobileNumber: '9876543211', password: 'Partner123!', role: 'PARTNER', isFirstLogin: false, bio: 'Keeping the magical kingdom organized.' });
  const couple = await Couple.create({ relationshipName: 'Aurora & Keeper', anniversaryDate: new Date('2020-02-14'), adminUser: admin._id, partnerUser: partner._id });
  admin.coupleId = couple._id;
  partner.coupleId = couple._id;
  await Promise.all([admin.save(), partner.save()]);
  await Content.insertMany([
    { title: 'Golden hour giggles', description: 'The sky turned pink just for us.', type: 'gallery', image: images.gallery, emoji: '📸', isPinned: true, createdBy: admin._id, coupleId: couple._id },
    { title: 'Strawberry cloud cake', description: 'A soft, sweet little celebration.', type: 'food', image: images.food, emoji: '🍰', metadata: { rating: 5 }, createdBy: admin._id, coupleId: couple._id },
    { title: 'A cozy movie night', description: 'Blankets, popcorn, and a happy ending.', type: 'movie', image: images.movie, emoji: '🎬', metadata: { rating: 4.8 }, createdBy: admin._id, coupleId: couple._id },
    { title: 'Our little soundtrack', description: 'Songs that make the room sparkle.', type: 'music', image: images.music, emoji: '🎧', metadata: { artist: 'The Dreamers' }, createdBy: admin._id, coupleId: couple._id },
    { title: 'Open when you need a hug', description: 'You are loved on ordinary days, too.', type: 'letter', emoji: '💌', createdBy: admin._id, coupleId: couple._id }
  ]);
  await Mood.insertMany([{ mood: 'Radiant', note: 'A soft day with good music.', intensity: 5, color: '#f5a3c7', createdBy: admin._id, coupleId: couple._id }]);
  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((error) => { console.error(error); process.exitCode = 1; });
