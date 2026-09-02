import express from 'express';
import passport from './config/passport.js';
import {
  registerUser,
  verifyRegisterOTP,
  resendOTP,
  loginUser,
  verifyLoginOTP,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  oauthCallback,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
} from './auth.controller.js';
import {
  registerUserValidations,
  verifyOTPValidations,
  resendOTPValidations,
  loginUserValidations,
  verifyLoginOTPValidations,
  forgotPasswordValidations,
  verifyForgotPasswordOTPValidations,
  resetPasswordValidations,
} from './validators/auth.validator.js';
import { authenticate } from './auth.middleware.js';
import { authRateLimiter, otpRateLimiter } from './middlewares/rate-limit.middleware.js';
import { getPrimaryFrontendUrl } from '../../utils/origin.js';

const router = express.Router();

router.use(passport.initialize());

const ensureOAuthConfigured = (provider) => (req, res, next) => {
  const upper = provider.toUpperCase();
  if (!process.env[`${upper}_CLIENT_ID`] || !process.env[`${upper}_CLIENT_SECRET`]) {
    const message = `${provider} OAuth is not configured yet. Add ${upper}_CLIENT_ID and ${upper}_CLIENT_SECRET.`;
    return res.redirect(`${getPrimaryFrontendUrl()}/signin?error=${encodeURIComponent(message)}`);
  }

  return next();
};

router.post('/register', otpRateLimiter, registerUserValidations, registerUser);
router.post(
  '/verify-register-otp',
  otpRateLimiter,
  verifyOTPValidations,
  verifyRegisterOTP
);
router.post('/resend-otp', otpRateLimiter, resendOTPValidations, resendOTP);
router.post('/login', authRateLimiter, loginUserValidations, loginUser);
router.post(
  '/verify-login-otp',
  otpRateLimiter,
  verifyLoginOTPValidations,
  verifyLoginOTP
);
router.post('/forgot-password', otpRateLimiter, forgotPasswordValidations, forgotPassword);
router.post(
  '/verify-forgot-password-otp',
  otpRateLimiter,
  verifyForgotPasswordOTPValidations,
  verifyForgotPasswordOTP
);
router.post('/reset-password', otpRateLimiter, resetPasswordValidations, resetPassword);

router.get(
  '/google',
  ensureOAuthConfigured('google'),
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: 'login',
    session: false,
  })
);

router.get(
  '/google/signup',
  ensureOAuthConfigured('google'),
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: 'signup',
    session: false,
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect(
          `${getPrimaryFrontendUrl()}/signin?error=${encodeURIComponent(info?.message || 'Google sign-in failed')}`
        );
      }

      req.user = user;
      req.authInfo = info || {};
      return next();
    })(req, res, next);
  },
  oauthCallback('google')
);

router.get(
  '/github',
  ensureOAuthConfigured('github'),
  passport.authenticate('github', {
    scope: ['user:email'],
    state: 'login',
    session: false,
  })
);

router.get(
  '/github/signup',
  ensureOAuthConfigured('github'),
  passport.authenticate('github', {
    scope: ['user:email'],
    state: 'signup',
    session: false,
  })
);

router.get(
  '/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { session: false }, (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect(
          `${getPrimaryFrontendUrl()}/signin?error=${encodeURIComponent(info?.message || 'GitHub sign-in failed')}`
        );
      }

      req.user = user;
      req.authInfo = info || {};
      return next();
    })(req, res, next);
  },
  oauthCallback('github')
);

router.get('/oauth-failure', (req, res) => {
  const provider = String(req.query.provider || '').toLowerCase();
  let message = req.query.error || 'OAuth authentication failed';

  if (provider === 'github') {
    message =
      'No GitHub account found for this user. If you registered using Google or email/password, try logging in with that method or sign up with GitHub.';
  } else if (provider === 'google') {
    message =
      'No Google account found for this user. If you registered using GitHub or email/password, try logging in with that method or sign up with Google.';
  }

  return res.redirect(`${getPrimaryFrontendUrl()}/signin?error=${encodeURIComponent(message)}`);
});

router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.post('/refresh-token', refreshToken);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);

export default router;
