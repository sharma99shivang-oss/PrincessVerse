import User from "../models/User.js";
import { verifyAccessToken } from "../utils/tokenService.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    console.log("===== AUTH REQUEST =====");
    console.log("Header:", header);

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const token = header.substring(7);

    const payload = verifyAccessToken(token);
    console.log("JWT Payload:", payload);

    const user = await User.findById(payload.sub).select("+password");

    console.log("User Found:", user?._id);

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    req.user = user;
    next();

  } catch (err) {
    console.log("JWT ERROR:", err.message);

    return res.status(401).json({
      message: "Your session has expired.",
      error: err.message,
    });
  }
}

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      message: "You do not have access to this area.",
    });
  }
  next();
};

export const adminOnly = allowRoles("ADMIN");
export const partnerOnly = allowRoles("PARTNER");