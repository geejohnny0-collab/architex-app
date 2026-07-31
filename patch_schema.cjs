const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Add fields to User model
const userInsertionStr = `
  credits       Int      @default(0)
  isCertified   Boolean  @default(false)
  transactions  Transaction[]
  advertisements Advertisement[]
  boostedJobs   BoostedJob[]
`;
// Insert right before @@index([email])
schema = schema.replace('  @@index([email])', userInsertionStr + '\n  @@index([email])');

// 2. Add relation to Post model
const postInsertionStr = `
  boostedJob    BoostedJob?
`;
schema = schema.replace('  @@index([authorId])', postInsertionStr + '\n  @@index([authorId])');

// 3. Append new models to the bottom
const newModels = `
// ─── Monetization ─────────────────────────────────────────────────────────────
model Transaction {
  id              Int      @id @default(autoincrement())
  userId          Int
  amountCent      Int      // USD in cents
  stripeSessionId String?  @unique
  status          String   @default("pending") // "pending" | "completed" | "failed"
  description     String   // e.g. "Purchased 1000 Credits"
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Advertisement {
  id          Int      @id @default(autoincrement())
  userId      Int
  companyName String
  imageUrl    String?
  targetUrl   String?
  headline    String
  description String
  impressions Int      @default(0)
  clicks      Int      @default(0)
  isActive    Boolean  @default(true)
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([isActive])
  @@index([userId])
}

model BoostedJob {
  id          Int      @id @default(autoincrement())
  userId      Int
  postId      Int      @unique
  isActive    Boolean  @default(true)
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([isActive])
}
`;

schema += newModels;

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('patched schema');
