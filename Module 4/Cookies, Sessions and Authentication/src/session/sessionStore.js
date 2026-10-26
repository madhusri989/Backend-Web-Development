const crypto = require('crypto');

// Learning/local-only in-memory store. Production needs a shared expiring store (for example Redis).
const sessions = new Map();

function create(userId, ttlMs) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + ttlMs;
  sessions.set(sessionId, { userId, expiresAt });
  return sessionId;
}

function get(sessionId) {
  if (typeof sessionId !== 'string') return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return { ...session };
}

function destroy(sessionId) {
  if (typeof sessionId !== 'string') return false;
  return sessions.delete(sessionId);
}

module.exports = { create, get, destroy };
