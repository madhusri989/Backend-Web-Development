const express = require('express');
const controller = require('../controllers/postController');

const router = express.Router();

// Resource-oriented contract: HTTP methods describe the action.
router.get('/posts', controller.listPosts);
router.get('/posts/:id', controller.getPost);
router.post('/posts', controller.createPost);
router.post('/posts/:id/likes', controller.likePost);

// Deliberately no legacy /getPosts, /getPost, /createPost, or /likePost routes.
module.exports = router;
