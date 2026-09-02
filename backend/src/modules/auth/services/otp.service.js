import crypto from 'crypto';
import redis from '../db/redis.js';

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS || 600);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

const buildOtpKey = (purpose, identifier) => `otp:${purpose}:${identifier}`;
const buildCooldownKey = (purpose, identifier) => `otp:cooldown:${purpose}:${identifier}`;

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const generateOtp = () => String(crypto.randomInt(100000, 999999));

const storeOtp = async (purpose, identifier, otp) => {
  const key = buildOtpKey(purpose, identifier);
  const payload = {
    hash: hashOtp(otp),
    attempts: 0,
  };
  await redis.set(key, JSON.stringify(payload), 'EX', OTP_TTL_SECONDS);
};

const checkCooldown = async (purpose, identifier) => {
  const cooldownKey = buildCooldownKey(purpose, identifier);
  const existing = await redis.get(cooldownKey);
  if (existing) return false;
  await redis.set(cooldownKey, '1', 'EX', OTP_RESEND_COOLDOWN_SECONDS);
  return true;
};

const verifyOtp = async (purpose, identifier, otp) => {
  const key = buildOtpKey(purpose, identifier);
  const raw = await redis.get(key);
  if (!raw) {
    return { ok: false, reason: 'OTP expired or not found' };
  }

  const payload = JSON.parse(raw);
  if (payload.attempts >= OTP_MAX_ATTEMPTS) {
    await redis.del(key);
    return { ok: false, reason: 'Maximum attempts exceeded' };
  }

  const providedHash = hashOtp(otp);
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(payload.hash, 'utf8'),
    Buffer.from(providedHash, 'utf8')
  );

  if (!isMatch) {
    const nextPayload = { ...payload, attempts: payload.attempts + 1 };
    await redis.set(key, JSON.stringify(nextPayload), 'EX', OTP_TTL_SECONDS);
    return { ok: false, reason: 'Invalid OTP' };
  }

  await redis.del(key);
  return { ok: true };
};

export {
  generateOtp,
  storeOtp,
  verifyOtp,
  checkCooldown,
  OTP_TTL_SECONDS,
};
