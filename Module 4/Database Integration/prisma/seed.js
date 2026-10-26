require('dotenv').config();
const prisma = require('@prisma/client').PrismaClient;
const client = new prisma();

async function main() {
  // Stable IDs preserve the starter seed's authorId references.
  await client.user.upsert({
    where: { id: 1 },
    update: { name: 'Community Demo User' },
    create: { id: 1, name: 'Community Demo User' },
  });

  await client.post.upsert({
    where: { id: 1 },
    update: {
      title: 'First post',
      body: 'The contract survives storage changes.',
      authorId: 1,
    },
    create: {
      id: 1,
      title: 'First post',
      body: 'The contract survives storage changes.',
      authorId: 1,
    },
  });

  await client.post.upsert({
    where: { id: 2 },
    update: {
      title: 'Second post',
      body: 'Migrations record database design.',
      authorId: 1,
    },
    create: {
      id: 2,
      title: 'Second post',
      body: 'Migrations record database design.',
      authorId: 1,
    },
  });
}

main()
  .then(() => console.log('Seed complete'))
  .catch((error) => {
    console.error('Seed failed:', error.code || error.name);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.$disconnect();
  });
