import jwt from 'jsonwebtoken';

const accessSecret = () => process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, coupleId: user.coupleId?.toString(), name: user.name }, accessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, refreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d'
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret());
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret());
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  };
}
