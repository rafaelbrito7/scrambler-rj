const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatDateTime(date: Date) {
  return dateFormat.format(date);
}

export function formatWhatsapp(digits: string) {
  const local = digits.length > 11 ? digits.slice(-11) : digits;
  const areaCode = local.slice(0, 2);
  const number = local.slice(2);
  const split = number.length - 4;

  return `(${areaCode}) ${number.slice(0, split)}-${number.slice(split)}`;
}

export function whatsappLink(digits: string) {
  const withCountry = digits.length > 11 ? digits : `55${digits}`;

  return `https://wa.me/${withCountry}`;
}

const priceFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatPrice(cents: number) {
  return priceFormat.format(cents / 100);
}

export const paymentLabels = {
  PENDING: "Pendente",
  PAID: "Pago",
} as const;

const rideDayFormat = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "America/Sao_Paulo",
});

const rideClockFormat = new Intl.DateTimeFormat("pt-BR", {
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Sao_Paulo",
});

// "sáb., 22 de nov." without the stray dots: "sáb 22 nov".
export function formatRideDay(date: Date) {
  return rideDayFormat.format(date).replace(/\./g, "").replace(/,| de /g, " ").replace(/\s+/g, " ");
}

// "7h" on the hour, "7h30" otherwise.
export function formatRideTime(date: Date) {
  const [hour, minute] = rideClockFormat.format(date).split(":");

  return minute === "00" ? `${Number(hour)}h` : `${Number(hour)}h${minute}`;
}

export function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function describeRideCounts(counts: { going: number; notGoing: number; noAnswer: number }) {
  const going = `${counts.going} ${counts.going === 1 ? "vai" : "vão"}`;
  const notGoing = `${counts.notGoing} ${counts.notGoing === 1 ? "não vai" : "não vão"}`;

  return `${going} · ${notGoing} · ${counts.noAnswer} sem resposta`;
}

const pastDayFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

// A day that may be in another year: "22 nov 2026".
export function formatPastDay(date: Date) {
  return pastDayFormat.format(date).replace(/\./g, "").replace(/ de /g, " ");
}

const monthYearFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

// "novembro de 2026".
export function formatMonthYear(date: Date) {
  return monthYearFormat.format(date);
}

export function profileHref(userId: string, viewerId: string) {
  return userId === viewerId ? "/perfil" : `/grupo/${userId}`;
}

// A count of people in words, with its own wording for nobody: "1 vai", "4 vão".
export function peopleLabel(count: number, one: string, many: string, none: string) {
  if (count === 0) return none;

  return `${count} ${count === 1 ? one : many}`;
}
