-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "revivedFromId" TEXT;

-- CreateTable
CREATE TABLE "BatchComeback" (
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchComeback_pkey" PRIMARY KEY ("batchId","userId")
);

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_revivedFromId_fkey" FOREIGN KEY ("revivedFromId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchComeback" ADD CONSTRAINT "BatchComeback_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchComeback" ADD CONSTRAINT "BatchComeback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

