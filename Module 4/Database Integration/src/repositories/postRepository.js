const prisma = require('../db/prisma');

// Preserve the repository contract; Prisma-specific vocabulary stays here.
async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  return prisma.post.findUnique({ where: { id: Number(id) } });
}

async function create(fields) {
  const data = {
    title: fields.title,
    body: fields.body || '',
  };
  if (fields.authorId !== undefined && fields.authorId !== null) {
    data.authorId = Number(fields.authorId);
  }
  return prisma.post.create({ data });
}

async function update(id, patch) {
  const numericId = Number(id);
  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  // updateMany provides the repository's null-on-missing contract.
  const result = await prisma.post.updateMany({
    where: { id: numericId },
    data,
  });
  if (result.count === 0) return null;
  return prisma.post.findUnique({ where: { id: numericId } });
}

async function remove(id) {
  const result = await prisma.post.deleteMany({
    where: { id: Number(id) },
  });
  return result.count > 0;
}

module.exports = { findAll, findById, create, update, remove };
