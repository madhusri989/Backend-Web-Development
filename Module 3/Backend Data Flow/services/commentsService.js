const postsRepo = require('./../repository/postsRepo');
const commentsRepo = require('./../repository/commentsRepo');
const AppError = require('./../utils/AppError');

/**
 * Add a comment as an ordered workflow: validate every guard before writes,
 * then insert the comment, increment the post counter, and return the comment.
 */
exports.addComment = async (postId, userId, body) => {
  const post = await postsRepo.findById(postId);

  // All checks happen before either write.
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (post.locked) {
    throw new AppError('Post is locked for new comments', 409);
  }

  const comment = await commentsRepo.insert({ postId, authorId: userId, body });
  await postsRepo.incrementCommentCount(postId);

  return comment;
};
