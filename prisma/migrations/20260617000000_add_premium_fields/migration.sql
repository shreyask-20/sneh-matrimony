-- AlterTable: Add premium fields to User (already applied to DB)
ALTER TABLE "User" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "premiumExpiresAt" TIMESTAMP(3);
