-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "packingNote" TEXT,
ADD COLUMN     "planB" TEXT;

-- CreateTable
CREATE TABLE "RideTip" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RideTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideTipChoice" (
    "rideId" TEXT NOT NULL,
    "tipId" TEXT NOT NULL,

    CONSTRAINT "RideTipChoice_pkey" PRIMARY KEY ("rideId","tipId")
);

-- CreateIndex
CREATE INDEX "RideTip_active_position_idx" ON "RideTip"("active", "position");

-- AddForeignKey
ALTER TABLE "RideTipChoice" ADD CONSTRAINT "RideTipChoice_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideTipChoice" ADD CONSTRAINT "RideTipChoice_tipId_fkey" FOREIGN KEY ("tipId") REFERENCES "RideTip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- The recommendations the group starts with; administrators keep the list from here on.
INSERT INTO "RideTip" ("id", "text", "icon", "position") VALUES
  ('tip_01', 'Tanque cheio na saída', 'fuel', 0),
  ('tip_02', 'Pneus calibrados', 'tyre', 1),
  ('tip_03', 'Corrente lubrificada', 'chain', 2),
  ('tip_04', 'Documento da moto e habilitação', 'document', 3),
  ('tip_05', 'Dinheiro para pedágio', 'money', 4),
  ('tip_06', 'Dinheiro para alimentação', 'food', 5),
  ('tip_07', 'Capa de chuva', 'rain', 6),
  ('tip_08', 'Agasalho ou segunda pele', 'warm', 7),
  ('tip_09', 'Jaqueta, luvas e bota', 'gear', 8),
  ('tip_10', 'Água', 'water', 9),
  ('tip_11', 'Protetor solar', 'sun', 10),
  ('tip_12', 'Kit de reparo de pneu', 'tools', 11),
  ('tip_13', 'Roupa de banho', 'swim', 12),
  ('tip_14', 'Carregador ou bateria extra', 'battery', 13);
