const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');
const http = require('./utils/http');

function createApp() {
  const app = express();
  app.use(express.json());

  app.use('/', postRoutes);
  // Explicitly retained only for demonstrating safe internal-error handling.
  app.get('/_demo/internal-error', controller.explode);

  // Unknown routes also use the same public error envelope.
  app.use((req, res) => {
    return http.sendError(res, 404, 'ROUTE_NOT_FOUND', 'Route not found');
  });

  // Never return stack traces, debug strings, or raw internal error messages.
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    const status = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 500
      ? err.statusCode
      : 500;

    if (status >= 500) {
      console.error('Internal API error:', err.message);
    }

    const code = status === 404
      ? (err.code || 'POST_NOT_FOUND')
      : status === 500
        ? 'INTERNAL_SERVER_ERROR'
        : (err.code || 'REQUEST_ERROR');
    const message = status === 500
      ? 'An unexpected error occurred'
      : (err.message || 'Request failed');

    return http.sendError(res, status, code, message);
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

module.exports = {
  createApp,
  resetData
};
