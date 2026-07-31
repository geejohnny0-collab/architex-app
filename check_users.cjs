const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, handle: true, userType: true, isPro: true, credits: true }
  });
  console.log('Users in database:', users);
}

main().finally(() => prisma.$disconnect());
