-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RideAnswer" AS ENUM ('GOING', 'NOT_GOING');

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "meetingPoint" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "returnsAt" TIMESTAMP(3) NOT NULL,
    "mapUrl" TEXT,
    "photoKey" TEXT,
    "status" "RideStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideResponse" (
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" "RideAnswer" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RideResponse_pkey" PRIMARY KEY ("rideId","userId")
);

-- CreateIndex
CREATE INDEX "Ride_status_startsAt_idx" ON "Ride"("status", "startsAt");

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideResponse" ADD CONSTRAINT "RideResponse_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideResponse" ADD CONSTRAINT "RideResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

