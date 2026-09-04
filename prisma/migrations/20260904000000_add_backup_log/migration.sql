-- CreateTable: BackupLog (admin weekly backup tracker)
CREATE TABLE "BackupLog" (
  "id" SERIAL NOT NULL,
  "adminId" TEXT NOT NULL,
  "exportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fileName" TEXT NOT NULL,
  "userCount" INTEGER NOT NULL,
  "counts" JSONB NOT NULL,
  "fileSizeBytes" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  CONSTRAINT "BackupLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackupLog_exportedAt_idx" ON "BackupLog"("exportedAt");

-- AddForeignKey
ALTER TABLE "BackupLog" ADD CONSTRAINT "BackupLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
