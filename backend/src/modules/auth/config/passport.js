import passport from 'passport';
import googleOauth from 'passport-google-oauth20';
import githubOauth from 'passport-github2';
import User from '../models/user.model.js';
import { normalizeEmail } from '../utils/normalize.js';

const { Strategy: GoogleStrategy } = googleOauth;
const { Strategy: GitHubStrategy } = githubOauth;
const defaultPort = process.env.PORT || '4000';
const backendUrl = process.env.BACKEND_URL || `http://localhost:${defaultPort}`;

const splitName = (displayName = '') => {
  const parts = String(displayName || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'User',
    lastName: parts.slice(1).join(' ') || 'OAuth',
  };
};

const buildOAuthUserPayload = ({ provider, providerId, email, fullName, profilePic }) => {
  const payload = {
    email: email ? normalizeEmail(email) : `${provider}-${providerId}@oauth.local`,
    fullName,
    provider,
    isVerified: true,
    profilePic: profilePic || '',
    isActive: true,
  };

  if (provider === 'google') {
    payload.googleId = providerId;
  }

  if (provider === 'github') {
    payload.githubId = providerId;
  }

  return payload;
};

const completeOAuth = async ({ provider, providerId, email, fullName, profilePic, mode }) => {
  const normalizedEmail = email ? normalizeEmail(email) : null;
  const existingByProvider = await User.findOne(
    provider === 'google' ? { googleId: providerId } : { githubId: providerId }
  );

  if (existingByProvider) {
    return { user: existingByProvider, isNewUser: false };
  }

  if (mode === 'login') {
    return {
      user: null,
      info: { message: `No ${provider} account found for this user. Please sign up first.` },
    };
  }

  if (normalizedEmail) {
    const existingByEmail = await User.findOne({ email: normalizedEmail });
    if (existingByEmail) {
      return {
        user: null,
        info: {
          message:
            'An account with this email already exists. Please sign in with your original login method.',
        },
      };
    }
  }

  const user = await User.create(
    buildOAuthUserPayload({
      provider,
      providerId,
      email: normalizedEmail,
      fullName,
      profilePic,
    })
  );

  return { user, isNewUser: true };
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${backendUrl}/api/auth/google/callback`,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          void accessToken;
          void refreshToken;

          const mode = req.query.state || 'login';
          const result = await completeOAuth({
            provider: 'google',
            providerId: profile.id,
            email: profile.emails?.[0]?.value || null,
            fullName: {
              firstName: profile.name?.givenName || 'Google',
              lastName: profile.name?.familyName || 'User',
            },
            profilePic: profile.photos?.[0]?.value || '',
            mode,
          });

          if (!result.user) {
            return done(null, false, result.info);
          }

          return done(null, result.user, { isNewUser: result.isNewUser });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${backendUrl}/api/auth/github/callback`,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          void accessToken;
          void refreshToken;

          const mode = req.query.state || 'login';
          const result = await completeOAuth({
            provider: 'github',
            providerId: String(profile.id),
            email: profile.emails?.[0]?.value || null,
            fullName: splitName(profile.displayName || profile.username || 'GitHub User'),
            profilePic: profile.photos?.[0]?.value || '',
            mode,
          });

          if (!result.user) {
            return done(null, false, result.info);
          }

          return done(null, result.user, { isNewUser: result.isNewUser });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

export default passport;
