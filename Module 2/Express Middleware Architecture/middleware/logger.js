/**
 * Log the method, path, and final response status when the response finishes.
 */
module.exports = function logger(req, res, next) {
  res.on('finish', () => {
    const shortId = req.id ? `[${req.id.slice(0, 8)}] ` : '';
    console.log(`${shortId}${req.method} ${req.path} ${res.statusCode}`);
  });

  next();
};
