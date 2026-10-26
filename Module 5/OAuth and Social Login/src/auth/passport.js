'use strict';
// auth/passport.js — Google OAuth strategy

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile.id;
    const email = profile.emails[0].value;
    const name = profile.displayName;

    // Check the stable Google identity first so returning users keep their account and role.
    const returningUser = users.find((user) => user.googleId === googleId);
    if (returningUser) {
      return done(null, returningUser);
    }

    // Link an existing local account only when Google confirms ownership of the email.
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      if (profile._json.email_verified !== true) {
        return done(null, false);
      }

      existingUser.googleId = googleId;
      return done(null, existingUser);
    }

    const newUser = {
      id: nextId(),
      googleId,
      email,
      name,
      role: 'member',
    };
    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/auth/google/callback',
    },
    verifyCallback,
  ),
);

// Exported so tests can call verifyCallback without a real browser.
module.exports = { passport, verifyCallback };
