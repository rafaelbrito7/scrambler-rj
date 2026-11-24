import { formatPrice, formatRideDay, formatRideTime } from "@/components/app/format";
import { formatRideDuration } from "@/server/ride-options";

type BatchShare = {
  id: string;
  model: string;
  unitPriceCents: number;
  sizes: string[];
  colors: { name: string }[];
};

type RideShare = {
  id: string;
  route: string;
  meetingPoint: string;
  startsAt: Date;
  returnsAt: Date;
  mapUrl: string | null;
  meetsAt?: Date | null;
  distanceKm?: number | null;
  rideMinutes?: number | null;
};

// Plain text for pasting in WhatsApp, where *asterisks* render as bold. It carries only what
// the campaign announces: no participant names and no phone numbers.
export function buildBatchShareText(batch: BatchShare, origin: string) {
  return [
    `*${batch.model}* · campanha de vestuário aberta no Scrambler RJ`,
    `${formatPrice(batch.unitPriceCents)} por peça`,
    `Cores: ${batch.colors.map((color) => color.name).join(", ")}`,
    `Tamanhos: ${batch.sizes.join(", ")}`,
    `Pede por aqui: ${origin}/vestuario/${batch.id}`,
  ].join("\n");
}

export function buildRideShareText(ride: RideShare, origin: string) {
  const lines = [
    `*${ride.route}* · passeio do Scrambler RJ`,
    `${formatRideDay(ride.startsAt)} · saída ${formatRideTime(ride.startsAt)} · retorno previsto ${formatRideTime(ride.returnsAt)}`,
    ride.meetsAt
      ? `Encontro às ${formatRideTime(ride.meetsAt)}: ${ride.meetingPoint}`
      : `Encontro: ${ride.meetingPoint}`,
  ];
  const sheet = [
    ride.distanceKm ? `${ride.distanceKm} km` : null,
    ride.rideMinutes ? `${formatRideDuration(ride.rideMinutes)} de moto` : null,
  ].filter(Boolean);

  if (sheet.length > 0) lines.push(sheet.join(" · "));

  if (ride.mapUrl) lines.push(`Mapa: ${ride.mapUrl}`);

  lines.push(`Diz se vai por aqui: ${origin}/passeios/${ride.id}`);

  return lines.join("\n");
}
