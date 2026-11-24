-- CreateTable
CREATE TABLE "RideAttendance" (
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "counts" BOOLEAN NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RideAttendance_pkey" PRIMARY KEY ("rideId","userId")
);

-- AddForeignKey
ALTER TABLE "RideAttendance" ADD CONSTRAINT "RideAttendance_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideAttendance" ADD CONSTRAINT "RideAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideAttendance" ADD CONSTRAINT "RideAttendance_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

