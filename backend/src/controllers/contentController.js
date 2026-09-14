import Content from '../models/Content.js';

export async function listContent(req, res) {
  const filter = { coupleId: req.user.coupleId };
  if (req.query.type) filter.type = req.query.type;
  const items = await Content.find(filter).sort({ isPinned: -1, createdAt: -1 }).limit(100);
  res.json({ items });
}

export async function getContent(req, res) {
  const item = await Content.findOne({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Memory not found.' });
  res.json({ item });
}

export async function createContent(req, res) {
  const item = await Content.create({ ...req.body, createdBy: req.user._id, coupleId: req.user.coupleId });
  res.status(201).json({ item });
}

export async function updateContent(req, res) {
  const item = await Content.findOneAndUpdate({ _id: req.params.id, coupleId: req.user.coupleId }, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Memory not found.' });
  res.json({ item });
}

export async function deleteContent(req, res) {
  const item = await Content.findOneAndDelete({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Memory not found.' });
  res.json({ message: 'Memory removed.' });
}

export async function dashboard(req, res) {
  const [items, recent] = await Promise.all([
    Content.find({ coupleId: req.user.coupleId }).sort({ createdAt: -1 }).limit(100),
    Content.find({ coupleId: req.user.coupleId }).sort({ createdAt: -1 }).limit(5)
  ]);
  const counts = items.reduce((acc, item) => ({ ...acc, [item.type]: (acc[item.type] || 0) + 1 }), {});
  res.json({ counts, recent, total: items.length });
}

export async function adminStats(req, res) {
  const [users, memories, types] = await Promise.all([
    (await import('../models/User.js')).default.countDocuments(),
    Content.countDocuments(),
    Content.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }])
  ]);
  res.json({ users, memories, types });
}
