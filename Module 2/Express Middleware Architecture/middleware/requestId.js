/**
 * Assign a unique UUID to each request and expose it to clients.
 */
const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
  const id = randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};
