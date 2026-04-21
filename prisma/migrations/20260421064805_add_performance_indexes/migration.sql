/*
  Warnings:

  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId",
ADD COLUMN     "height" TEXT,
ADD COLUMN     "roleName" "RoleName" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "Role";

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "status" "PhotoStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionRemarks" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_userOneId_idx" ON "Conversation"("userOneId");

-- CreateIndex
CREATE INDEX "Conversation_userTwoId_idx" ON "Conversation"("userTwoId");

-- CreateIndex
CREATE INDEX "Message_readAt_senderId_idx" ON "Message"("readAt", "senderId");

-- CreateIndex
CREATE INDEX "User_isApproved_profileVisible_gender_idx" ON "User"("isApproved", "profileVisible", "gender");

-- CreateIndex
CREATE INDEX "User_isApproved_profileVisible_city_idx" ON "User"("isApproved", "profileVisible", "city");

-- CreateIndex
CREATE INDEX "User_isApproved_profileVisible_religion_idx" ON "User"("isApproved", "profileVisible", "religion");

-- CreateIndex
CREATE INDEX "User_isApproved_profileVisible_education_idx" ON "User"("isApproved", "profileVisible", "education");

-- CreateIndex
CREATE INDEX "User_isApproved_profileVisible_profession_idx" ON "User"("isApproved", "profileVisible", "profession");

-- CreateIndex
CREATE INDEX "User_isApproved_profileVisible_community_idx" ON "User"("isApproved", "profileVisible", "community");

-- CreateIndex
CREATE INDEX "User_isApproved_profileVisible_birthDate_idx" ON "User"("isApproved", "profileVisible", "birthDate");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
