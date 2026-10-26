'use strict';

// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000;

module.exports = rateLimit({
  windowMs: WINDOW_MS,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetTime = req.rateLimit && req.rateLimit.resetTime;
    const retryAfterSeconds =
      resetTime instanceof Date
        ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
        : Math.ceil(WINDOW_MS / 1000);

    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many authentication attempts. Please try again later.',
      },
    });
  },
});

/*
 * For a multi-instance deployment, configure rate-limit-redis as the limiter's
 * store, backed by a shared Redis connection. The default in-memory store keeps
 * a separate counter in each Node.js process, so a load balancer can spread
 * requests across instances and let one client exceed the intended limit.
 * Redis gives every instance a shared counter and consistent window state.
 */
