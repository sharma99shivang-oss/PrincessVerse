import Gift from '../models/Gift.js';
import Song from '../models/Song.js';
import Movie from '../models/Movie.js';
import Food from '../models/Food.js';
import Mood from '../models/Mood.js';
import BucketList from '../models/BucketList.js';
import Memory from "../models/Memory.js";
import Couple from "../models/Couple.js";
import ActivityLog from "../models/ActivityLog.js";
import Letter from "../models/Letter.js";
import Timeline from "../models/Timeline.js";
export const phase4Models = { gifts: Gift, songs: Song, movies: Movie, foods: Food, moods: Mood, 'bucket-list': BucketList };

function paging(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function safeRegex(value) {
  return new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

function filterFor(req, resource) {
  const filter = { coupleId: req.user.coupleId };
  if (resource === 'gifts' && req.user.role === 'PARTNER') {
    filter.$or = [
      { isRevealed: true },
      { revealDate: { $exists: true, $lte: new Date() } }
    ];
  }
  const clauses = [];
  const search = req.query.search?.trim();
  if (search) {
    const regex = safeRegex(search);
    const fields = resource === 'songs' ? ['title', 'artist', 'album']
      : resource === 'foods' ? ['name', 'title', 'description', 'location']
        : resource === 'moods' ? ['mood', 'note', 'title']
          : ['title', 'description', 'category'];
    clauses.push({ $or: fields.map((field) => ({ [field]: regex })) });
  }
  if (req.query.category) clauses.push({ category: req.query.category });
  if (req.query.favorite === 'true') clauses.push({ $or: [{ isFavorite: true }, { favorite: true }] });
  if (req.query.favorite === 'false') clauses.push({ isFavorite: { $ne: true }, favorite: { $ne: true } });
  if (clauses.length) filter.$and = clauses;
  return filter;
}

const clean = (body) => Object.fromEntries(Object.entries(body || {}).filter(([key]) =>
  !['_id', 'coupleId', 'createdBy', 'createdAt', 'updatedAt'].includes(key)));

export async function listPhase4(req, res) {
  const resource = req.resourceType;
  const Model = phase4Models[resource];
  const { page, limit, skip } = paging(req.query);
  const filter = filterFor(req, resource);
  const [items, total] = await Promise.all([
    Model.find(filter)
      .populate("createdBy", "name avatar role").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Model.countDocuments(filter)
  ]);
  res.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function getPhase4(req, res) {
  const item = await phase4Models[req.resourceType].findOne({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  res.json({ item });
}

export async function createPhase4(req, res) {
  const item = await phase4Models[req.resourceType].create({ ...clean(req.body), createdBy: req.user._id, coupleId: req.user.coupleId });
  res.status(201).json({ item });
}

export async function updatePhase4(req, res) {
  const item = await phase4Models[req.resourceType].findOneAndUpdate(
    { _id: req.params.id, coupleId: req.user.coupleId }, clean(req.body),
    { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  res.json({ item });
}

export async function deletePhase4(req, res) {
  const item = await phase4Models[req.resourceType].findOneAndDelete({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  res.json({ message: 'Item removed.' });
}

export async function togglePhase4Favorite(req, res) {
  const Model = phase4Models[req.resourceType];
  const item = await Model.findOne({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  const favorite = !(item.isFavorite || item.favorite);
  item.isFavorite = favorite;
  item.favorite = favorite;
  await item.save();
  res.json({ item, favorite });
}
export async function phase4Dashboard(req, res) {
  const coupleId = req.user.coupleId;

  // Couple info
  const couple = await Couple.findById(coupleId)
    .populate("adminUser", "name avatar bio nickname relationshipQuote")
    .populate("partnerUser", "name avatar bio nickname relationshipQuote");

  // All data together
  const [
    memories,
    letters,
    gifts,
    songs,
    movies,
    foods,
    moods,
    bucketList,
    recentActivity,
    currentMood,
  ] = await Promise.all([
    Memory.find({ coupleId })
      .sort({ createdAt: -1 })
      .lean(),

    Letter.countDocuments({ coupleId }),

    Gift.countDocuments({ coupleId }),

    Song.countDocuments({ coupleId }),

    Movie.countDocuments({ coupleId }),

    Food.countDocuments({ coupleId }),

    Mood.countDocuments({ coupleId }),

    BucketList.countDocuments({ coupleId }),

    ActivityLog.find({ coupleId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("actor", "name avatar")
      .lean(),

    // 🌸 Today's Mood Only (current date)
    Mood.find({
      coupleId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name avatar role")
      .lean(),
  ]);

  // Total gallery images
  const galleryImages = memories.reduce((total, memory) => {
    if (memory.images?.length) return total + memory.images.length;
    if (memory.image) return total + 1;
    return total;
  }, 0);

  // Relationship stats
  let daysTogether = 0;
  let daysToAnniversary = 0;

  if (couple?.anniversaryDate) {
    const anniversary = new Date(couple.anniversaryDate);

    daysTogether = Math.floor(
      (Date.now() - anniversary.getTime()) / (1000 * 60 * 60 * 24)
    );

    const nextAnniversary = new Date(anniversary);
    nextAnniversary.setFullYear(new Date().getFullYear());

    if (nextAnniversary < new Date()) {
      nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1);
    }

    daysToAnniversary = Math.ceil(
      (nextAnniversary - Date.now()) / (1000 * 60 * 60 * 24)
    );
  }

  res.json({
    couple,
    todayMoods: currentMood,
    counts: {
      memories: memories.length,
      galleryImages,
      letters,
      gifts,
      songs,
      movies,
      foods,
      moods,
      bucketList,
    },

    latestMemory: memories[0] || null,

    relationship: {
      daysTogether,
      daysToAnniversary,
    },

    recentActivity,
  });
}