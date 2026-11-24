-- CreateTable
CREATE TABLE "RidePhoto" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoKey" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "RidePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RidePhoto_photoKey_key" ON "RidePhoto"("photoKey");

-- CreateIndex
CREATE INDEX "RidePhoto_rideId_approved_createdAt_idx" ON "RidePhoto"("rideId", "approved", "createdAt");

-- AddForeignKey
ALTER TABLE "RidePhoto" ADD CONSTRAINT "RidePhoto_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RidePhoto" ADD CONSTRAINT "RidePhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

