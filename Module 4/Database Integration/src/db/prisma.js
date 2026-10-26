const { PrismaClient } = require('@prisma/client');

// One client per application process; repositories share this instance.
const prisma = new PrismaClient();

module.exports = prisma;
