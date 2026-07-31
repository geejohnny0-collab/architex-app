const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { passwordHash },
    create: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test Developer',
      handle: 'testdev',
      userType: 'developer',
      role: 'Software Engineer',
      isPro: false,
      credits: 100
    }
  });

  console.log('Seed user created:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
