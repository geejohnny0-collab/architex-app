-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "isCertified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("avatarUrl", "bio", "coverUrl", "createdAt", "credits", "desiredRate", "email", "expectedSalary", "github", "googleId", "handle", "id", "isCertified", "location", "name", "openToWork", "passwordHash", "role", "skills", "updatedAt", "userType", "verified", "website", "workMode") SELECT "avatarUrl", "bio", "coverUrl", "createdAt", "credits", "desiredRate", "email", "expectedSalary", "github", "googleId", "handle", "id", "isCertified", "location", "name", "openToWork", "passwordHash", "role", "skills", "updatedAt", "userType", "verified", "website", "workMode" FROM "User";
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
