'use strict';

const crypto = require('node:crypto');

const store = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;

function generateOTP() {
  // randomInt's upper bound is exclusive; this produces exactly six digits.
  return String(crypto.randomInt(100000, 1000000));
}

function storeOTP(email, otp) {
  store.set(email, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
}

function verifyOTP(email, code) {
  const entry = store.get(email);

  if (!entry) {
    return { ok: false, reason: 'not_found' };
  }

  if (Date.now() >= entry.expiresAt) {
    store.delete(email);
    return { ok: false, reason: 'expired' };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (entry.otp !== code) {
    entry.attempts += 1;
    return { ok: false, reason: 'wrong_code' };
  }

  // OTPs are single-use: successful verification consumes the stored code.
  store.delete(email);
  return { ok: true };
}

function markVerified(email) {
  // In production, persist the verified status on the user's database record.
  console.log('Email verified:', email);
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  markVerified,
  _store: store,
};
