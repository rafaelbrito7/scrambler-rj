type CalendarRide = {
  id: string;
  route: string;
  meetingPoint: string;
  startsAt: Date;
  returnsAt: Date;
  meetsAt: Date | null;
  distanceKm: number | null;
};

// Instants go out in UTC, so every calendar shows the ride at the right local time whatever
// clock the server or the phone runs on.
function stamp(instant: Date) {
  return instant.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");
}

// Calendar files limit a line to 75 octets; longer ones continue on a line that starts with a
// space. Folding by character keeps accented letters whole.
function fold(line: string) {
  const pieces: string[] = [];
  let current = "";
  let size = 0;

  for (const character of line) {
    const octets = Buffer.byteLength(character);

    if (size + octets > 73) {
      pieces.push(current);
      current = " ";
      size = 1;
    }

    current += character;
    size += octets;
  }

  pieces.push(current);

  return pieces.join("\r\n");
}

// One event for the person's own calendar. It is a snapshot: a later change to the ride does
// not reach a calendar that already imported it.
export function buildRideCalendar(ride: CalendarRide, origin: string, now: Date) {
  const address = `${origin}/passeios/${ride.id}`;
  const description = [ride.distanceKm ? `${ride.distanceKm} km.` : null, `Detalhes e presença: ${address}`]
    .filter(Boolean)
    .join(" ");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scrambler RJ//Passeios//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:passeio-${ride.id}@scramblerrj`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(ride.meetsAt ?? ride.startsAt)}`,
    `DTEND:${stamp(ride.returnsAt)}`,
    `SUMMARY:${escapeText(`${ride.route} · Scrambler RJ`)}`,
    `LOCATION:${escapeText(ride.meetingPoint)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(fold).join("\r\n")}\r\n`;
}
