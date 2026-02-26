const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const googleId = profile.id;
    const name = profile.displayName;

    let user = await User.findOne({ email });

    if (user) {
      if (user.authProvider === 'local') {
        user.googleId = googleId;
        user.authProvider = 'local+google';
        user.isVerified = true;
        await user.save();
        return done(null, user);
      } else {
        return done(null, user);
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        isVerified: true,
        password: null
      });
      return done(null, user);
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;