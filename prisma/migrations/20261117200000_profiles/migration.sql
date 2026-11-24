-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT,
    "instagram" TEXT,
    "whatsapp" TEXT NOT NULL,
    "photoKey" TEXT,
    "shirtSize" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "bloodType" TEXT,
    "reminderDismissedAt" TIMESTAMP(3),
    "mainBikeId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Bike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "engineSize" INTEGER NOT NULL,
    "year" INTEGER,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_mainBikeId_key" ON "Profile"("mainBikeId");

-- CreateIndex
CREATE INDEX "Bike_userId_createdAt_idx" ON "Bike"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_mainBikeId_fkey" FOREIGN KEY ("mainBikeId") REFERENCES "Bike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bike" ADD CONSTRAINT "Bike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Everyone who already sent a join request gets a profile and a main bike copied from it.
INSERT INTO "Bike" ("id", "userId", "model", "engineSize", "createdAt")
SELECT 'bike_' || jr."id", jr."userId", jr."bikeModel", jr."engineSize", jr."createdAt"
FROM "JoinRequest" jr;

INSERT INTO "Profile" ("userId", "fullName", "whatsapp", "mainBikeId", "updatedAt")
SELECT jr."userId", jr."fullName", jr."whatsapp", 'bike_' || jr."id", CURRENT_TIMESTAMP
FROM "JoinRequest" jr;
