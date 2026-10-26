require('dotenv').config();
const express = require('express');
const postController = require('./controllers/postController');
const prisma = require('./db/prisma');

const app = express();
app.use(express.json());

app.get('/posts', postController.list);
app.get('/posts/:id', postController.get);
app.post('/posts', postController.create);
app.patch('/posts/:id', postController.update);
app.delete('/posts/:id', postController.remove);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  let statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 500
    ? error.statusCode
    : 500;
  let message = statusCode === 500 ? 'An unexpected error occurred' : error.message;

  // Translate known database constraint failures without exposing raw DB messages.
  if (error.code === 'P2002') {
    statusCode = 409;
    message = 'A record with these details already exists';
  } else if (error.code === 'P2003') {
    statusCode = 400;
    message = 'A referenced resource does not exist';
  } else if (error.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (statusCode >= 500) {
    console.error('API request failed:', error.code || error.name || 'UnknownError');
  }

  return res.status(statusCode).json({ error: message });
});

async function start() {
  await prisma.$connect();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API listening on port ${port}; PostgreSQL connected`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Unable to start API because the database connection failed:', error.code || error.name);
    process.exit(1);
  });
}

module.exports = app;
