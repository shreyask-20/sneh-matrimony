-- AlterTable: Add displayId column to User
ALTER TABLE "User" ADD COLUMN "displayId" TEXT;

-- CreateIndex: Unique constraint for displayId
CREATE UNIQUE INDEX "User_displayId_key" ON "User"("displayId");
