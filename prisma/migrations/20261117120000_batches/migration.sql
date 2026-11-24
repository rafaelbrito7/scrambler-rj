-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "sizes" TEXT[],
    "status" "BatchStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchColor" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoKey" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "BatchColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Batch_status_openedAt_idx" ON "Batch"("status", "openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BatchColor_batchId_position_key" ON "BatchColor"("batchId", "position");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchColor" ADD CONSTRAINT "BatchColor_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

