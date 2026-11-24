-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "description" TEXT,
ADD COLUMN     "meetsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RideStop" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "place" TEXT,
    "time" TEXT,
    "note" TEXT,

    CONSTRAINT "RideStop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RideStop_rideId_position_key" ON "RideStop"("rideId", "position");

-- AddForeignKey
ALTER TABLE "RideStop" ADD CONSTRAINT "RideStop_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

