import Memory from '../models/Memory.js';
import Album from '../models/Album.js';
import Letter from '../models/Letter.js';
import Timeline from '../models/Timeline.js';
import Comment from '../models/Comment.js';
import { uploadBuffer, deleteAsset } from '../services/cloudinaryService.js';
import Couple from "../models/Couple.js";

const models = { memories: Memory, albums: Album, letters: Letter, timeline: Timeline };
const clean = (body, blocked = []) => Object.fromEntries(Object.entries(body).filter(([key]) => !blocked.includes(key)));

function paging(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function withMemoryFavorite(item, userId) {
  if (item?.favoritedBy) item.favorite = item.favoritedBy.some((id) => String(id) === String(userId));
  return item;
}

function queryFilter(req, type) {
  const filter = { coupleId: req.user.coupleId };
  // 🔒 Partner ko future locked letters mat dikhao
  if (type === "letters" && req.user.role === "PARTNER") {
    filter.$or = [
      { isLocked: false },
      { lockUntilDate: { $lte: new Date() } },
    ];
  }
  if (req.query.search) {
    const regex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = type === 'letters'
      ? [{ title: regex }, { content: regex }]
      : [{ title: regex }, { description: regex }];
  }

  if (req.query.favorite === 'true' && type === 'memories') filter.favoritedBy = req.user._id;
  if (req.query.from || req.query.to) {
    const dateField = type === 'timeline' ? 'eventDate' : type === 'memories' ? 'date' : 'createdAt';
    filter[dateField] = {};
    if (req.query.from) filter[dateField].$gte = new Date(req.query.from);
    if (req.query.to) filter[dateField].$lte = new Date(req.query.to);
  }
  if (req.query.tag && type === 'memories') filter.tags = req.query.tag;
  return filter;
}

export async function listResource(req, res) {
  const type = req.resourceType;
  const Model = models[type];
  const { page, limit, skip } = paging(req.query);
  const filter = queryFilter(req, type);
  const itemQuery = Model.find(filter).sort(type === 'timeline' ? { eventDate: -1 } : { createdAt: -1 }).skip(skip).limit(limit);
  if (type === 'albums') itemQuery.populate('memories');
  const [items, total] = await Promise.all([
    itemQuery,
    Model.countDocuments(filter)
  ]);
  const mapped = items.map((item) => {
    if (type === 'memories') return withMemoryFavorite(item, req.user._id);
    if (type === 'letters') return {
      ...item.toObject(),
      message: item.content,
      content: item.content,
    };
    if (type === 'timeline') return { ...item.toObject(), date: item.date || item.eventDate };
    return item;
  });
  res.json({ items: mapped, letters: type === 'letters' ? mapped : undefined, events: type === 'timeline' ? mapped : undefined, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function getResource(req, res) {
  const Model = models[req.resourceType];
  const itemQuery = Model.findOne({ _id: req.params.id, coupleId: req.user.coupleId });
  if (req.resourceType === 'albums') itemQuery.populate('memories');
  const item = await itemQuery;
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  const mapped =
    req.resourceType === "letters"
      ? {
        ...item.toObject(),
        message: item.content,
        content: item.content,
      }
      : req.resourceType === "timeline"
        ? { ...item.toObject(), date: item.date || item.eventDate }
        : item;
  res.json({ item: mapped, ...(req.resourceType === 'memories' ? { memory: withMemoryFavorite(item, req.user._id) } : {}), ...(req.resourceType === 'letters' ? { letter: mapped } : {}) });
}

export async function createResource(req, res) {
  const type = req.resourceType;
  const Model = models[type];
  const body = clean(req.body, ['_id', 'coupleId', 'createdBy', 'favoritedBy', 'mediaUrl', 'mediaPublicId', 'coverUrl', 'coverPublicId']);
  // 💌 Letter lock date format
  if (type === "letters") {
    body.content = req.body.content;

    body.isLocked = req.body.isLocked || false;

    body.lockUntilDate =
      req.body.isLocked && req.body.lockUntilDate
        ? new Date(req.body.lockUntilDate)
        : null;
  }
  const file = req.file || (req.files && Object.values(req.files).flat()[0]);
  if (file) {
    const result = await uploadBuffer(file, `princessverse/${type}`);
    if (type === 'memories' || type === 'timeline') Object.assign(body, { mediaUrl: result.secure_url, mediaPublicId: result.public_id, mediaResourceType: result.resource_type });
    if (type === 'albums') Object.assign(body, { coverUrl: result.secure_url, coverPublicId: result.public_id });
  }
  if (type === 'memories' && req.files) {
    const imageFiles = req.files.images || [];
    const videoFiles = req.files.videos || [];
    const results = await Promise.all([...imageFiles, ...videoFiles].map((entry) => uploadBuffer(entry, `princessverse/${type}`)));
    body.images = results.filter((result) => result.resource_type === 'image').map((result) => result.secure_url);
    body.videos = results.filter((result) => result.resource_type === 'video').map((result) => result.secure_url);
    body.imagePublicIds = results.filter((result) => result.resource_type === 'image').map((result) => result.public_id);
    body.videoPublicIds = results.filter((result) => result.resource_type === 'video').map((result) => result.public_id);
  }
  const item = await Model.create({ ...body, createdBy: req.user._id, coupleId: req.user.coupleId });
  res.status(201).json({ item, ...(type === 'memories' ? { memory: item } : {}), ...(type === 'letters' ? { letter: { ...item.toObject(), message: item.message || item.content } } : {}) });
}

export async function updateResource(req, res) {
  const type = req.resourceType;
  const Model = models[type];
  const item = await Model.findOne({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  const body = clean(req.body, ['_id', 'coupleId', 'createdBy', 'favoritedBy', 'mediaUrl', 'mediaPublicId', 'coverUrl', 'coverPublicId']);
  const file = req.file || (req.files && Object.values(req.files).flat()[0]);
  if (file) {
    const result = await uploadBuffer(file, `princessverse/${type}`);
    if (type === 'memories' || type === 'timeline') {
      await deleteAsset(item.mediaPublicId, item.mediaResourceType);
      Object.assign(body, { mediaUrl: result.secure_url, mediaPublicId: result.public_id, mediaResourceType: result.resource_type });
    } else {
      await deleteAsset(item.coverPublicId);
      Object.assign(body, { coverUrl: result.secure_url, coverPublicId: result.public_id });
    }
  }
  if (type === "memories" && req.files?.images?.length) {
    const uploads = await Promise.all(
      req.files.images.map((file) =>
        uploadBuffer(file, "princessverse/memories")
      )
    );

    item.images.push(...uploads.map((u) => u.secure_url));
    item.imagePublicIds.push(...uploads.map((u) => u.public_id));
  } if (type === "memories" && req.files) {
    // Images Upload
    if (req.files.images?.length) {
      const imageUploads = await Promise.all(
        req.files.images.map((file) =>
          uploadBuffer(file, "princessverse/memories")
        )
      );

      item.images.push(...imageUploads.map((u) => u.secure_url));
      item.imagePublicIds.push(...imageUploads.map((u) => u.public_id));
    }

    // Videos Upload
    if (req.files.videos?.length) {
      const videoUploads = await Promise.all(
        req.files.videos.map((file) =>
          uploadBuffer(file, "princessverse/memories")
        )
      );

      item.videos.push(...videoUploads.map((u) => u.secure_url));
      item.videoPublicIds.push(...videoUploads.map((u) => u.public_id));
    }
  }
  Object.assign(item, body);
  await item.save();
  res.json({ item, ...(type === 'memories' ? { memory: withMemoryFavorite(item, req.user._id) } : {}) });
}

export async function deleteResource(req, res) {
  const type = req.resourceType;
  const Model = models[type];
  const item = await Model.findOneAndDelete({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  await deleteAsset(item.mediaPublicId || item.coverPublicId, item.mediaResourceType || 'image');
  if (type === 'memories') {
    await Promise.all((item.imagePublicIds || []).map((publicId) => deleteAsset(publicId, 'image')));
    await Promise.all((item.videoPublicIds || []).map((publicId) => deleteAsset(publicId, 'video')));
  }
  if (type === 'albums') await Memory.updateMany({ _id: { $in: item.memories }, coupleId: req.user.coupleId }, { $pull: { albums: item._id } });
  await Comment.deleteMany({ contentType: type === 'memories' ? 'Memory' : type === 'albums' ? 'Album' : type === 'letters' ? 'Letter' : 'Timeline', contentId: item._id, coupleId: req.user.coupleId });
  res.json({ message: 'Item removed.' });
}

export async function toggleFavorite(req, res) {
  const item = await Memory.findOne({ _id: req.params.id, coupleId: req.user.coupleId });
  if (!item) return res.status(404).json({ message: 'Memory not found.' });
  const userId = String(req.user._id);
  const index = item.favoritedBy.findIndex((id) => String(id) === userId);
  if (index === -1) item.favoritedBy.push(req.user._id);
  else item.favoritedBy.splice(index, 1);
  item.isFavorite = item.favoritedBy.length > 0;
  await item.save();
  res.json({ item, memory: withMemoryFavorite(item, req.user._id), favorite: index === -1 });
}

export async function listComments(req, res) {
  const contentType = req.params.type || 'Memory';
  const contentId = req.params.id || req.params.contentId;
  const allowed = ['Memory', 'Album', 'Letter', 'Timeline'];
  if (!allowed.includes(contentType)) return res.status(400).json({ message: 'Invalid content type.' });
  const target = await models[{ Memory: 'memories', Album: 'albums', Letter: 'letters', Timeline: 'timeline' }[contentType]].findOne({ _id: contentId, coupleId: req.user.coupleId }).select('_id');
  if (!target) return res.status(404).json({ message: 'Item not found.' });
  const { page, limit, skip } = paging(req.query);
  const filter = { contentType, contentId, coupleId: req.user.coupleId };
  const [items, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name avatar role"),
    Comment.countDocuments(filter),
  ]);

  const comments = items.map((comment) => ({
    ...comment.toObject(),
    text: comment.content,
    createdBy: comment.author, // Frontend ko ye field chahiye
  }));

  res.json({
    items: comments,
    comments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function createComment(req, res) {
  const { content, contentId, contentType } = req.body;

  if (!content?.trim()) {
    return res.status(400).json({
      message: "Comment cannot be empty.",
    });
  }

  // 🔒 Partner permission check
  if (req.user.role === "PARTNER") {
    const couple = await Couple.findById(req.user.coupleId);

    if (!couple?.permissions?.canCommentMemories) {
      return res.status(403).json({
        message: "Your partner has disabled comments.",
      });
    }
  }

  const comment = await Comment.create({
    content: content.trim(),
    contentId,
    contentType: "Memory", // Memory comments
    author: req.user._id,
    coupleId: req.user.coupleId,
  });

  await comment.populate("author", "name avatar role");

  res.status(201).json({
    comment: {
      ...comment.toObject(),
      createdBy: comment.author, // frontend compatibility
      text: comment.content, // frontend compatibility
    },
  });
}
// 💌 Partner Reply to Letter
export async function replyLetter(req, res) {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({
      message: "Reply message is required.",
    });
  }

  const letter = await Letter.findOne({
    _id: req.params.id,
    coupleId: req.user.coupleId,
  });

  if (!letter) {
    return res.status(404).json({
      message: "Letter not found.",
    });
  }

  // Admin can always reply
  if (req.user.role === "PARTNER") {
    const couple = await Couple.findById(req.user.coupleId);

    if (!couple.permissions.canReplyLetters) {
      return res.status(403).json({
        message: "Reply permission is disabled by your partner.",
      });
    }
  }

  letter.replies.push({
    sender: req.user._id,
    message,
  });

  await letter.save();

  await letter.populate("replies.sender", "name avatar role");

  res.status(201).json({
    replies: letter.replies,
  });
}
// 🗑️ Delete Letter Reply
export async function deleteReply(req, res) {
  const letter = await Letter.findOne({
    _id: req.params.letterId,
    coupleId: req.user.coupleId,
  });

  if (!letter) {
    return res.status(404).json({
      message: "Letter not found.",
    });
  }

  const reply = letter.replies.id(req.params.replyId);

  if (!reply) {
    return res.status(404).json({
      message: "Reply not found.",
    });
  }

  // Admin can delete any reply
  if (req.user.role !== "ADMIN") {
    const couple = await Couple.findById(req.user.coupleId);

    if (!couple.permissions.canDeleteOwnReplies) {
      return res.status(403).json({
        message: "Reply delete permission is disabled.",
      });
    }

    if (String(reply.sender) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can delete only your own reply.",
      });
    }
  }

  reply.deleteOne();

  await letter.save();

  res.json({
    message: "Reply deleted successfully.",
    replies: letter.replies,
  });
}
// 💌 Admin Delete Letter
export async function deleteLetter(req, res) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Only Admin can delete letters.",
    });
  }

  const letter = await Letter.findOneAndDelete({
    _id: req.params.id,
    coupleId: req.user.coupleId,
  });

  if (!letter) {
    return res.status(404).json({
      message: "Letter not found.",
    });
  }

  res.json({
    message: "Letter deleted successfully.",
  });
}
export async function deleteComment(req, res) {
  const filter = { _id: req.params.id, coupleId: req.user.coupleId };
  if (req.user.role !== 'ADMIN') filter.author = req.user._id;
  const comment = await Comment.findOneAndDelete(filter);
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });
  res.json({ message: 'Comment removed.' });
}

export async function deleteMemoryImage(req, res) {
  const memory = await Memory.findOne({
    _id: req.params.id,
    coupleId: req.user.coupleId,
  });

  if (!memory) {
    return res.status(404).json({ message: "Memory not found." });
  }

  const index = Number(req.params.index);

  if (
    Number.isNaN(index) ||
    index < 0 ||
    index >= memory.images.length
  ) {
    return res.status(400).json({ message: "Invalid image index." });
  }

  // Cloudinary se sirf wahi image delete
  const publicId = memory.imagePublicIds?.[index];
  if (publicId) {
    await deleteAsset(publicId, "image");
  }

  // Array se sirf ek image remove
  memory.images.splice(index, 1);
  memory.imagePublicIds.splice(index, 1);

  await memory.save();

  res.json({
    message: "Image deleted successfully.",
    memory,
  });
}