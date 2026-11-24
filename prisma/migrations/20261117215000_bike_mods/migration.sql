-- CreateTable
CREATE TABLE "BikeMod" (
    "id" TEXT NOT NULL,
    "bikeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BikeMod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BikeMod_bikeId_createdAt_idx" ON "BikeMod"("bikeId", "createdAt");

-- AddForeignKey
ALTER TABLE "BikeMod" ADD CONSTRAINT "BikeMod_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

