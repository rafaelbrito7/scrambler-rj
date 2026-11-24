// Plain lists shared by the server and the browser; nothing here may touch the database or disk.
export const STOP_KINDS = [
  { value: "MEETING", label: "Encontro" },
  { value: "FUEL", label: "Abastecimento" },
  { value: "FOOD", label: "Café ou refeição" },
  { value: "VIEWPOINT", label: "Mirante ou foto" },
  { value: "DESTINATION", label: "Destino" },
  { value: "RETURN", label: "Retorno" },
];

export const SURFACES = [
  { value: "PAVED", label: "Asfalto" },
  { value: "DIRT", label: "Terra" },
  { value: "MIXED", label: "Misto" },
];

export const DIFFICULTIES = [
  { value: "EASY", label: "Leve" },
  { value: "MODERATE", label: "Moderado" },
  { value: "DEMANDING", label: "Exigente" },
];

export function surfaceLabel(value: string | null) {
  return SURFACES.find((option) => option.value === value)?.label ?? null;
}

export function difficultyLabel(value: string | null) {
  return DIFFICULTIES.find((option) => option.value === value)?.label ?? null;
}

// Riding time as people write it: "3h20", "3:20", "3h" or "45min". Returns minutes, or null
// when the text is not a duration of up to a day.
export function parseRideTime(text: string): number | null {
  const trimmed = text.trim().toLowerCase();
  const onlyMinutes = /^(\d{1,3})\s*min$/.exec(trimmed);
  const hoursAndMinutes = /^(\d{1,2})\s*[h:]\s*(\d{1,2})?$/.exec(trimmed);
  let minutes: number | null = null;

  if (onlyMinutes) minutes = Number(onlyMinutes[1]);

  if (hoursAndMinutes) {
    const extra = Number(hoursAndMinutes[2] ?? 0);

    minutes = extra < 60 ? Number(hoursAndMinutes[1]) * 60 + extra : null;
  }

  return minutes !== null && minutes > 0 && minutes <= 24 * 60 ? minutes : null;
}

// 200 minutes reads "3h20"; 180, "3h"; 45, "45min".
export function formatRideDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}min`;

  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}

// The small set of pictures a recommendation can carry; the panel offers these by name.
export const TIP_ICONS = [
  { value: "fuel", label: "Combustível" },
  { value: "tyre", label: "Pneu" },
  { value: "chain", label: "Corrente" },
  { value: "document", label: "Documento" },
  { value: "money", label: "Dinheiro" },
  { value: "food", label: "Alimentação" },
  { value: "rain", label: "Chuva" },
  { value: "warm", label: "Agasalho" },
  { value: "gear", label: "Equipamento" },
  { value: "water", label: "Água" },
  { value: "sun", label: "Sol" },
  { value: "tools", label: "Ferramenta" },
  { value: "swim", label: "Banho" },
  { value: "battery", label: "Bateria" },
  { value: "firstaid", label: "Primeiros socorros" },
  { value: "camera", label: "Câmera" },
  { value: "bag", label: "Bagagem" },
  { value: "check", label: "Geral" },
];

export const TIP_TEXT_MAX_LENGTH = 60;
export const PACKING_NOTE_MAX_LENGTH = 200;
export const PLAN_B_MAX_LENGTH = 280;

export type RideTipItem = { id: string; text: string; icon: string };

export const MAX_STOPS = 20;
export const STOP_NOTE_MAX_LENGTH = 140;
export const RIDE_DESCRIPTION_MAX_LENGTH = 500;

export type StopInput = {
  kind: string;
  name: string;
  place: string;
  time: string;
  note: string;
  // Both empty, or both a number as text: the pin the administrator dropped on the map.
  lat?: string;
  lon?: string;
};

export type MapPoint = { lat: number; lon: number };

export function stopKindLabel(kind: string) {
  return STOP_KINDS.find((option) => option.value === kind)?.label ?? kind;
}

// The ride's instants as the form fields expect them, on Rio's clock.
export function rioDateInput(instant: Date) {
  return new Date(instant.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function rioTimeInput(instant: Date) {
  return new Date(instant.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(11, 16);
}

// "08:10" as the ride pages write times: "8h10", and "7h" on the hour.
export function formatStopTime(time: string) {
  const [hour, minute] = time.split(":");

  return minute === "00" ? `${Number(hour)}h` : `${Number(hour)}h${minute}`;
}

// A new ride starts with its one mandatory stop waiting to be filled.
export const emptyRideForm = {
  route: "",
  description: "",
  date: "",
  meetingTime: "",
  departureTime: "",
  returnTime: "",
  mapUrl: "",
  distanceKm: "",
  surface: "",
  difficulty: "",
  rideTime: "",
  tolls: "",
  tipIds: [] as string[],
  packingNote: "",
  planB: "",
  stops: [{ kind: "MEETING", name: "", place: "", time: "", note: "", lat: "", lon: "" }],
};
