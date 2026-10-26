/**
 * Posts router (mounted at /posts in app.js).
 * auditWrite runs only for POST requests that create posts.
 */
const express = require('express');
const router = express.Router();
const auditWrite = require('../middleware/auditWrite');

const posts = [{ id: 1, title: 'Hello World' }];

// Public feed: global observability only; no write-audit middleware.
router.get('/', (req, res) => {
  res.json({ data: posts });
});

// Audit writes only on the post creation endpoint.
router.post('/', auditWrite, (req, res) => {
  const post = { id: posts.length + 1, title: req.body.title || 'Untitled' };
  posts.push(post);
  res.status(201).json({ data: post });
});

module.exports = router;
