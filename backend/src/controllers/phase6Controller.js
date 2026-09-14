import Memory from '../models/Memory.js';
import Mood from '../models/Mood.js';
import Letter from '../models/Letter.js';
import Timeline from '../models/Timeline.js';
import Comment from '../models/Comment.js';
import Gift from '../models/Gift.js';
import Song from '../models/Song.js';
import Movie from '../models/Movie.js';
import Food from '../models/Food.js';
import BucketList from '../models/BucketList.js';
import ActivityLog from '../models/ActivityLog.js';
import Couple from '../models/Couple.js';
import SmartMemory from '../models/SmartMemory.js';
import { logActivity } from '../utils/activity.js';

const contentModels = { memories: Memory, moods: Mood, letters: Letter, timeline: Timeline, comments: Comment, gifts: Gift, songs: Song, movies: Movie, foods: Food, bucketList: BucketList };
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);
const clampDays = (value) => Math.min(Math.max(Number.parseInt(value, 10) || 30, 7), 365);

function coupleId(req, res) {
  if (!req.user?.coupleId) {
    res.status(400).json({ message: 'Your account is not linked to a couple.' });
    return null;
  }
  return req.user.coupleId;
}

async function activityDates(id, days = 365) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [activity, memories, moods, letters, timeline] = await Promise.all([
    ActivityLog.find({ coupleId: id, createdAt: { $gte: since } }).select('createdAt').lean(),
    Memory.find({ coupleId: id, createdAt: { $gte: since } }).select('createdAt').lean(),
    Mood.find({ coupleId: id, date: { $gte: since } }).select('date createdAt').lean(),
    Letter.find({ coupleId: id, createdAt: { $gte: since } }).select('createdAt').lean(),
    Timeline.find({ coupleId: id, eventDate: { $gte: since } }).select('eventDate createdAt').lean()
  ]);
  return new Set([...activity, ...memories, ...moods, ...letters, ...timeline].map((item) =>
    dayKey(item.date || item.eventDate || item.createdAt)
  ));
}

function calculateStreak(dates) {
  const today = new Date();
  let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!dates.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let current = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const sorted = [...dates].sort();
  let longest = 0;
  let run = 0;
  let previous;
  for (const value of sorted) {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (previous && (date - previous) === 86400000) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return { current, longest, activeDays: dates.size, lastActiveDate: sorted.at(-1) || null };
}

export async function getAnalytics(req, res) {
  const id = coupleId(req, res);
  if (!id) return;
  const since = new Date(Date.now() - clampDays(req.query.days) * 24 * 60 * 60 * 1000);
  const counts = await Promise.all(Object.entries(contentModels).map(async ([name, Model]) =>
    [name, await Model.countDocuments({ coupleId: id })]
  ));
  const [moodTrend, recentActivity, streakDates] = await Promise.all([
    Mood.aggregate([
      { $match: { coupleId: id, date: { $gte: since } } },
      { $group: { _id: '$mood', count: { $sum: 1 }, averageIntensity: { $avg: '$intensity' } } },
      { $sort: { count: -1 } }
    ]),
    ActivityLog.find({ coupleId: id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(20).populate('actor', 'name avatar').lean(),
    activityDates(id, 365)
  ]);
  res.json({
    period: { days: clampDays(req.query.days), from: since, to: new Date() },
    counts: Object.fromEntries(counts),
    moodTrend,
    streaks: calculateStreak(streakDates),
    recentActivity
  });
}

export async function getStreaks(req, res) {
  const id = coupleId(req, res);
  if (!id) return;
  res.json({ streaks: calculateStreak(await activityDates(id, 365)) });
}

export async function getAchievements(req, res) {
  const id = coupleId(req, res);
  if (!id) return;
  const [counts, streakDates, favorites, completed] = await Promise.all([
    Promise.all([Memory, Letter, Timeline, Comment].map((Model) => Model.countDocuments({ coupleId: id }))),
    activityDates(id, 365),
    Memory.countDocuments({ coupleId: id, $or: [{ isFavorite: true }, { favorite: true }] }),
    BucketList.countDocuments({ coupleId: id, $or: [{ completed: true }, { isCompleted: true }] })
  ]);
  const values = { memories: counts[0], letters: counts[1], timeline: counts[2], comments: counts[3], favorites, completed, streak: calculateStreak(streakDates).longest };
  const definitions = [
    ['first-memory', 'First memory', 'Add your first shared memory.', 'memories', 1],
    ['memory-collector', 'Memory collector', 'Save 10 shared memories.', 'memories', 10],
    ['love-letters', 'Love letters', 'Write 5 letters to each other.', 'letters', 5],
    ['storytellers', 'Storytellers', 'Create 10 timeline moments.', 'timeline', 10],
    ['keepsakes', 'Keepsakes', 'Favorite 5 memories.', 'favorites', 5],
    ['bucket-achiever', 'Bucket achiever', 'Complete 5 bucket-list dreams.', 'completed', 5],
    ['consistent-love', 'Consistent love', 'Reach a 7-day activity streak.', 'streak', 7]
  ];
  const achievements = definitions.map(([key, title, description, metric, target]) => ({
    key, title, description, metric, target, progress: Math.min(values[metric], target),
    unlocked: values[metric] >= target
  }));
  res.json({ achievements, metrics: values });
}

export async function listSmartMemories(req, res) {
  const id = coupleId(req, res);
  if (!id) return;
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
  const items = await SmartMemory.find({ coupleId: id }).sort({ generatedAt: -1 }).limit(limit).populate('memoryIds', 'title memoryDate images');
  res.json({ items, smartMemories: items });
}

export async function generateSmartMemory(req, res) {
  const id = coupleId(req, res);
  if (!id) return;
  const days = clampDays(req.body?.days);
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const memories = await Memory.find({ coupleId: id, $or: [{ memoryDate: { $gte: from } }, { createdAt: { $gte: from } }] })
    .sort({ memoryDate: -1, createdAt: -1 }).limit(50).select('title description location tags memoryDate createdAt').lean();
  if (!memories.length) return res.status(404).json({ message: 'Add a few memories before creating a smart summary.' });
  const places = [...new Set(memories.map((item) => item.location).filter(Boolean))];
  const tags = [...new Set(memories.flatMap((item) => item.tags || []))].slice(0, 8);
  const requestedTitle = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const title = requestedTitle.slice(0, 160) || `Your last ${days} days together`;
  const details = memories.slice(0, 8).map((item) => item.title).join(', ');
  const summary = `${memories.length} shared ${memories.length === 1 ? 'moment' : 'moments'} came together${places.length ? ` across ${places.join(', ')}` : ''}. Highlights include ${details}.${tags.length ? ` Themes: ${tags.join(', ')}.` : ''}`;
  const item = await SmartMemory.create({ coupleId: id, title, summary, memoryIds: memories.map((memory) => memory._id), sourceFrom: from, sourceTo: new Date() });
  await logActivity({ req, action: 'smart-memory.generated', entityType: 'SmartMemory', entityId: item._id });
  res.status(201).json({ item, smartMemory: item });
}
