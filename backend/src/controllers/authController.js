import User from '../models/User.js';
import Couple from '../models/Couple.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, refreshCookieOptions } from '../utils/tokenService.js';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  mobileNumber: user.mobileNumber,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  favoriteColor: user.favoriteColor,
  coverPhoto: user.coverPhoto,
  nickname: user.nickname,
  relationshipQuote: user.relationshipQuote,
  birthday: user.birthday,
  instagramUsername: user.instagramUsername,
  loveLanguage: user.loveLanguage,
  location: user.location,
  favoriteSong: user.favoriteSong,
  favoriteFood: user.favoriteFood,
  coupleId: user.coupleId,
  isFirstLogin: user.isFirstLogin,
  joinedAt: user.joinedAt
});

function validateMobile(mobile) {
  return /^[6-9]\d{9}$/.test(String(mobile || ''));
}

function validatePassword(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password || '');
}

async function issueTokens(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
  await user.save();
  res.cookie('refreshToken', refreshToken, refreshCookieOptions());
  return accessToken;
}

export async function register(req, res) {
  const { name, mobileNumber, password, confirmPassword, partnerName, partnerMobileNumber, relationshipName, anniversaryDate } = req.body;

  console.log("=== REGISTER START ===");
  console.log(req.body);

  console.log({
    mobileNumber,
    partnerMobileNumber,
    partnerName,
    relationshipName,
  });



  if (!name || !mobileNumber || !password || !partnerName || !partnerMobileNumber || !relationshipName) {
    return res.status(400).json({ message: 'Please complete all required couple details.' });
  }
  if (!validateMobile(mobileNumber) || !validateMobile(partnerMobileNumber)) {
    return res.status(400).json({ message: 'Mobile numbers must contain exactly 10 digits.' });
  }
  if (mobileNumber === partnerMobileNumber) return res.status(400).json({ message: 'Admin and partner numbers must be different.' });
  if (!validatePassword(password)) return res.status(400).json({ message: 'Password needs 8 characters, an uppercase letter, a number, and a special character.' });
  if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
  if (await User.exists({ mobileNumber: { $in: [mobileNumber, partnerMobileNumber] } })) {
    return res.status(409).json({ message: 'This mobile number is already registered.' });
  }

  const temporaryPassword = `PV${Math.random().toString(36).slice(-6)}!`;

  console.log("Partner Temporary Password:", temporaryPassword);
  const admin = await User.create({ name, mobileNumber, password, role: 'ADMIN' });
  const partner = await User.create({ name: partnerName, mobileNumber: partnerMobileNumber, password: temporaryPassword, role: 'PARTNER', isFirstLogin: true, temporaryPassword: true });
  const couple = await Couple.create({ relationshipName, anniversaryDate: anniversaryDate || undefined, adminUser: admin._id, partnerUser: partner._id });
  admin.coupleId = couple._id;
  partner.coupleId = couple._id;
  await Promise.all([admin.save(), partner.save()]);
  const accessToken = await issueTokens(admin, res);
  res.status(201).json({ accessToken, user: publicUser(admin), partner: { name: partner.name, mobileNumber: partner.mobileNumber, temporaryPassword } });
}

export async function login(req, res) {
  const { mobileNumber, password } = req.body;
  const query = { mobileNumber };
  const user = await User.findOne(query).select('+password +refreshTokens');
  if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Mobile number or password is incorrect.' });
  const accessToken = await issueTokens(user, res);
  res.json({ accessToken, user: publicUser(user) });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword || ''))) return res.status(400).json({ message: 'Current password is incorrect.' });
  if (!validatePassword(newPassword)) return res.status(400).json({ message: 'Password needs 8 characters, an uppercase letter, a number, and a special character.' });
  if (newPassword !== confirmPassword) return res.status(400).json({ message: 'New passwords do not match.' });
  user.password = newPassword;
  user.isFirstLogin = false;
  user.temporaryPassword = false;
  await user.save();
  res.json({ user: publicUser(user), message: 'Password updated.' });
}

export async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Refresh token missing.' });
  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(token)) return res.status(401).json({ message: 'Refresh token is no longer valid.' });
    user.refreshTokens = user.refreshTokens.filter((item) => item !== token);
    const accessToken = await issueTokens(user, res);
    res.json({ accessToken, user: publicUser(user) });
  } catch {
    res.status(401).json({ message: 'Refresh token is invalid.' });
  }
}

export async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token && req.user) {
    const user = await User.findById(req.user._id).select('+refreshTokens');
    if (user) {
      user.refreshTokens = (user.refreshTokens || []).filter((item) => item !== token);
      await user.save();
    }
  }
  res.clearCookie('refreshToken', { ...refreshCookieOptions(), maxAge: undefined }).json({ message: 'Logged out.' });
}

export const me = (req, res) => res.json({ user: publicUser(req.user) });
