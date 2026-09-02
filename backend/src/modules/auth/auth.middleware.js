import jwt from 'jsonwebtoken';
import redis from './db/redis.js';
import User from './models/user.model.js';
import { logger } from './utils/logger.js';

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return req.cookies?.access_token || null;
};

const isTokenBlacklisted = async (jti) => {
  if (!jti) return false;
  const blacklisted = await redis.get(`bl:${jti}`);
  return Boolean(blacklisted);
};

const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
   
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
   
    const blacklisted = await isTokenBlacklisted(payload.jti);
    if (blacklisted) {
      return res.status(401).json({ message: 'Session expired' });
    }

    const user = await User.findById(payload.sub).lean();
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    req.user = user;
    req.accessTokenJti = payload.jti;
    return next();
  } catch (error) {
    logger.warn('Access token verification failed');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user?.role || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  return next();
};

const protect = authenticate;

export {
  authenticate,
  protect,
  isTokenBlacklisted,
  isAdmin,
};