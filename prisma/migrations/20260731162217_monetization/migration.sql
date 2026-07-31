/*
  Warnings:

  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Follow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userAId" INTEGER NOT NULL,
    "userBId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "format" TEXT,
    "bytes" INTEGER,
    "uploadedById" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "amountCent" INTEGER NOT NULL,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Advertisement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "targetUrl" TEXT,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Advertisement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoostedJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoostedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BoostedJob_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "postId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "parentId" INTEGER,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("authorId", "content", "createdAt", "id", "postId") SELECT "authorId", "content", "createdAt", "id", "postId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE TABLE "new_Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Like" ("id", "postId", "userId") SELECT "id", "postId", "userId" FROM "Like";
DROP TABLE "Like";
ALTER TABLE "new_Like" RENAME TO "Like";
CREATE INDEX "Like_postId_idx" ON "Like"("postId");
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("content", "createdAt", "id", "receiverId", "senderId") SELECT "content", "createdAt", "id", "receiverId", "senderId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");
CREATE TABLE "new_Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("createdAt", "id", "read", "type", "userId") SELECT "createdAt", "id", "read", "type", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_read_idx" ON "Notification"("read");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "imageUrl" TEXT,
    "codeSnippet" TEXT,
    "hasProposal" BOOLEAN NOT NULL DEFAULT false,
    "projectBudget" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("authorId", "content", "createdAt", "id", "updatedAt") SELECT "authorId", "content", "createdAt", "id", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Post_category_idx" ON "Post"("category");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "bio" TEXT,
    "role" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'developer',
    "location" TEXT,
    "website" TEXT,
    "github" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "desiredRate" TEXT,
    "expectedSalary" TEXT,
    "workMode" TEXT,
    "openToWork" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "isCertified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "email", "handle", "id", "name", "passwordHash", "updatedAt") SELECT "avatarUrl", "createdAt", "email", "handle", "id", "name", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_handle_idx" ON "User"("handle");
CREATE INDEX "User_userType_idx" ON "User"("userType");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Conversation_userAId_idx" ON "Conversation"("userAId");

-- CreateIndex
CREATE INDEX "Conversation_userBId_idx" ON "Conversation"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userAId_userBId_key" ON "Conversation"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "Upload_uploadedById_idx" ON "Upload"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_stripeSessionId_key" ON "Transaction"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Advertisement_isActive_idx" ON "Advertisement"("isActive");

-- CreateIndex
CREATE INDEX "Advertisement_userId_idx" ON "Advertisement"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoostedJob_postId_key" ON "BoostedJob"("postId");

-- CreateIndex
CREATE INDEX "BoostedJob_isActive_idx" ON "BoostedJob"("isActive");
