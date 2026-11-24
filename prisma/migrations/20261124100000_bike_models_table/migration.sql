-- AlterTable
ALTER TABLE "Bike" ADD COLUMN     "listedModelId" TEXT;

-- CreateTable
CREATE TABLE "BikeModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engineSize" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BikeModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BikeModel_name_key" ON "BikeModel"("name");

-- CreateIndex
CREATE INDEX "BikeModel_active_position_idx" ON "BikeModel"("active", "position");

-- CreateIndex
CREATE INDEX "Bike_listedModelId_idx" ON "Bike"("listedModelId");

-- AddForeignKey
ALTER TABLE "Bike" ADD CONSTRAINT "Bike_listedModelId_fkey" FOREIGN KEY ("listedModelId") REFERENCES "BikeModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- The list that lived in the code, in the same order.
INSERT INTO "BikeModel" ("id", "name", "engineSize", "position") VALUES
  ('bikemodel_scrambler_400_x', 'Scrambler 400 X', 400, 0),
  ('bikemodel_scrambler_400_xc', 'Scrambler 400 XC', 400, 1),
  ('bikemodel_scrambler_900', 'Scrambler 900', 900, 2),
  ('bikemodel_street_scrambler', 'Street Scrambler', 900, 3),
  ('bikemodel_scrambler_1200_x', 'Scrambler 1200 X', 1200, 4),
  ('bikemodel_scrambler_1200_xc', 'Scrambler 1200 XC', 1200, 5),
  ('bikemodel_scrambler_1200_xe', 'Scrambler 1200 XE', 1200, 6),
  ('bikemodel_scrambler_865', 'Scrambler 865', 865, 7);

-- Bikes already registered as a listed model point at it. Name and engine size must both
-- match, so no bike changes model or engine size here; the rest stay as "Outro".
UPDATE "Bike" SET "listedModelId" = "BikeModel"."id"
FROM "BikeModel"
WHERE "Bike"."model" = "BikeModel"."name" AND "Bike"."engineSize" = "BikeModel"."engineSize";
