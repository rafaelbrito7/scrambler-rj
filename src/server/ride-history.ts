// Level badges describe road ridden with the group, never rank: the highest mark reached.
export const RIDE_LEVELS = [
  { rides: 1, name: "Primeira saída" },
  { rides: 5, name: "Pegou estrada" },
  { rides: 10, name: "Rodado" },
  { rides: 25, name: "Estradeiro" },
  { rides: 50, name: "Lenda da serra" },
] as const;

export type RideLevel = {
  name: string;
  next: { name: string; remaining: number } | null;
};

// No ride, no badge.
export function levelFor(rideCount: number): RideLevel | null {
  const reached = RIDE_LEVELS.findLast((level) => rideCount >= level.rides);

  if (!reached) return null;

  const next = RIDE_LEVELS.find((level) => level.rides > rideCount);

  return {
    name: reached.name,
    next: next ? { name: next.name, remaining: next.rides - rideCount } : null,
  };
}

const monthFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// "2026-11", on Brasília's calendar.
export function monthOf(date: Date) {
  return monthFormat.format(date).slice(0, 7);
}

// Months in a row with at least one ride done. Only months in which the group rode count:
// one with no ride at all neither adds nor breaks. The month still running does not break the
// streak before it ends.
export function streaksFor(riderMonths: Iterable<string>, groupMonths: Iterable<string>, now: Date) {
  const ridden = new Set(riderMonths);
  const thisMonth = monthOf(now);
  const months = [...new Set(groupMonths)].toSorted();
  let run = 0;
  let best = 0;

  for (const month of months) {
    const isStillOpen = month === thisMonth && !ridden.has(month);

    if (isStillOpen) continue;

    run = ridden.has(month) ? run + 1 : 0;
    best = Math.max(best, run);
  }

  return { current: run, best };
}
