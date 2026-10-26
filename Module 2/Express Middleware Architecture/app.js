/**
 * Express Middleware Architecture — Build the Pipeline
 *
 * Global middleware order:
 *   1) requestId — attaches a UUID to req and the X-Request-Id header
 *   2) logger    — logs method, path, and final status
 *   3) timing    — logs request duration
 *
 * auditWrite is mounted only on POST /posts in routes/posts.js.
 */
const express = require('express');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');

const requestId = require('./middleware/requestId');
const logger = require('./middleware/logger');
const timing = require('./middleware/timing');

const app = express();

// Parse JSON request bodies before routes handle them.
app.use(express.json());

// Global observability pipeline: order matters.
app.use(requestId);
app.use(logger);
app.use(timing);

// Routers come after the global middleware.
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

const PORT = 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
