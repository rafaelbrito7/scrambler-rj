// Plain lists shared by the server and the browser; nothing here may touch the database or disk.
export const REGIONS = [
  { value: "ZONA_SUL", label: "Zona Sul" },
  { value: "ZONA_NORTE", label: "Zona Norte" },
  { value: "ZONA_OESTE", label: "Zona Oeste" },
  { value: "CENTRO", label: "Centro" },
  { value: "NITEROI", label: "Niterói e região" },
  { value: "BAIXADA", label: "Baixada Fluminense" },
  { value: "OUTRA_CIDADE", label: "Outra cidade" },
];

export const EXPERIENCE_LEVELS = [
  { value: "STARTING", label: "Começando" },
  { value: "ROAD", label: "Estrada" },
  { value: "ROAD_AND_DIRT", label: "Estrada e terra" },
];

export const BIO_MAX_LENGTH = 140;

function labelOf(options: { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? null;
}

export function regionLabel(value: string | null) {
  return labelOf(REGIONS, value);
}

export function experienceLabel(value: string | null) {
  return labelOf(EXPERIENCE_LEVELS, value);
}

const monthAndYear = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function formatMemberSince(date: Date) {
  return monthAndYear.format(date);
}

const dayAndMonth = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" });

export type Birthday = { day: number; month: number };

// Reads "12/08", "12-8" or "12 08". The year is never asked for and never kept. February 29
// is a real birthday, so the check uses a leap year.
export function parseBirthday(text: string): Birthday | null {
  const match = /^(\d{1,2})\s*[/.\s-]\s*(\d{1,2})$/.exec(text.trim());

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const date = new Date(Date.UTC(2024, month - 1, day));
  const isRealDate = date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  return isRealDate ? { day, month } : null;
}

export function formatBirthday({ day, month }: Birthday) {
  return dayAndMonth.format(new Date(Date.UTC(2024, month - 1, day)));
}

export function birthdayInputValue(birthday: Birthday | null) {
  if (!birthday) return "";

  return `${String(birthday.day).padStart(2, "0")}/${String(birthday.month).padStart(2, "0")}`;
}

const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "America/Sao_Paulo" });
const monthNumber = new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: "America/Sao_Paulo" });

// The group's month is Brasília's, whatever clock the server runs on.
export function currentMonth(now: Date) {
  return { month: Number(monthNumber.format(now)), name: monthName.format(now) };
}
