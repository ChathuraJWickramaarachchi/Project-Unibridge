import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Configure Google Strategy
const setupGoogleStrategy = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth not configured - Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env');
    return false;
  }

  const baseURL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
  const callbackURL = `${baseURL}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('📥 Google OAuth - Processing profile:', profile.emails[0].value);

          // Check if user already exists with Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('✅ Existing Google user found:', user.email);
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            console.log('🔗 Linking Google to existing user:', user.email);
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isVerified = true;
            
            // Fill in missing required fields if they're empty
            if (!user.phone || user.phone.trim() === '') {
              user.phone = '+1-000-000-0000';
            }
            if (!user.address || user.address.trim() === '') {
              user.address = 'To be updated';
            }
            
            if (!user.profile?.avatar && profile.photos[0]?.value) {
              user.profile = user.profile || {};
              user.profile.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // Create new user
          const names = profile.displayName.split(' ');
          const firstName = names[0] || 'User';
          const lastName = names.slice(1).join(' ') || '';

          console.log('🆕 Creating new user from Google:', profile.emails[0].value);

          user = await User.create({
            firstName,
            lastName,
            email: profile.emails[0].value,
            googleId: profile.id,
            authProvider: 'google',
            isVerified: true,
            phone: '+1-000-000-0000', // Placeholder - user can update later
            address: 'To be updated', // Placeholder - user can update later
            profile: {
              avatar: profile.photos[0]?.value || '',
            },
          });

          console.log('✅ User created successfully:', user.email);
          return done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );

  console.log('✅ Google OAuth strategy configured');
  console.log('   Callback URL:', callbackURL);
  return true;
};

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initialize Google OAuth
export const initializeGoogleOAuth = () => {
  return setupGoogleStrategy();
};

export default passport;
