import User from '../models/User.js';
import { verifyAccessToken } from '../utils/tokenService.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Authentication required.' });
    const payload = verifyAccessToken(header.slice(7));
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Account not found.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired.' });
  }
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have access to this area.' });
  next();
};

export const adminOnly = allowRoles('ADMIN');
export const partnerOnly = allowRoles('PARTNER');
