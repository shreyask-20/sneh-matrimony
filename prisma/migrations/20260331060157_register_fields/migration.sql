-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "locationPreference" TEXT,
ADD COLUMN     "preferredAgeRange" TEXT,
ADD COLUMN     "religionCommunity" TEXT,
ALTER COLUMN "castePreference" DROP NOT NULL,
ALTER COLUMN "subCastePreference" DROP NOT NULL,
ALTER COLUMN "expectations" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "profession" TEXT;
