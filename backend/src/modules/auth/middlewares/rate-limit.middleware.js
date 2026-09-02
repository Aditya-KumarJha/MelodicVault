import rateLimit from 'express-rate-limit';

const buildLimiter = (options) => {
  if (process.env.NODE_ENV === 'test') {
    return (req, res, next) => next();
  }
  return rateLimit(options);
};

const authRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const otpRateLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export { authRateLimiter, otpRateLimiter };
