const initialPosts = require('../data/postStore');

// Repository contract:
// Replacing this Map with Prisma changes only this file's storage operations
// and may introduce async methods. Services, controllers, routes, response
// shapes, validation rules, and business behavior remain unchanged; Prisma
// records should be mapped to the same post shape before returning them.
const postsById = new Map(initialPosts.map((post) => [post.id, { ...post }]));
let nextId = Math.max(0, ...postsById.keys()) + 1;

function findAll() {
  // Return a fresh array and fresh record objects so callers cannot mutate storage.
  return Array.from(postsById.values(), (post) => ({ ...post }));
}

function findById(id) {
  const post = postsById.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const post = {
    id: nextId++,
    ...fields,
  };
  postsById.set(post.id, post);
  return { ...post };
}

function update(id, patch) {
  const numericId = Number(id);
  const existing = postsById.get(numericId);
  if (!existing) return null;

  const updated = { ...existing, ...patch, id: numericId };
  postsById.set(numericId, updated);
  return { ...updated };
}

function remove(id) {
  return postsById.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };
