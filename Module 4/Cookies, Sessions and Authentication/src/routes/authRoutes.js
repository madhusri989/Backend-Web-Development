const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../db/prisma');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const { COOKIE_NAME, cookieOptions, SESSION_TTL_MS } = require('../session/cookieConfig');

const router = express.Router();
const invalidCredentials = {
  error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
};
const invalidSession = {
  error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
};

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || !email.trim() ||
        typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Email and password are required' },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json(invalidCredentials);
    }

    const sessionId = sessionStore.create(user.id, SESSION_TTL_MS);
    res.cookie(COOKIE_NAME, sessionId, { ...cookieOptions, signed: true });
    return res.status(200).json(safeUser(user));
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      sessionStore.destroy(req.sessionId);
      return res.status(401).json(invalidSession);
    }
    return res.status(200).json(safeUser(user));
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies?.[COOKIE_NAME];
    if (sessionId) sessionStore.destroy(sessionId);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, signed: true });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
