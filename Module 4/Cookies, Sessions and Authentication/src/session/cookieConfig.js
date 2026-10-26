const SESSION_TTL_MS = Math.max(60_000, Number(process.env.SESSION_TTL_MS) || 3_600_000);

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
  maxAge: SESSION_TTL_MS,
};

module.exports = {
  COOKIE_NAME: 'sid',
  SESSION_TTL_MS,
  cookieOptions,
};
