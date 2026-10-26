const sessionStore = require('../session/sessionStore');
const { COOKIE_NAME } = require('../session/cookieConfig');

module.exports = function requireSession(req, res, next) {
  const sessionId = req.signedCookies?.[COOKIE_NAME];
  if (typeof sessionId !== 'string' || !sessionId) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  req.userId = session.userId;
  req.sessionId = sessionId;
  return next();
};
