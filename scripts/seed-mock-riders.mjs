import pg from "pg";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { writeFile, rm } from "node:fs/promises";

const c = new pg.Client({ connectionString: process.argv[2], connectionTimeoutMillis: 10000 }); await c.connect();
const q = (text, values) => c.query(text, values);

// limpa os fictícios de uma execução anterior
const old = (await q(`select u.id, p."photoKey" as pk from "User" u left join "Profile" p on p."userId" = u.id where u.email like 'mock-%@teste.local'`)).rows;
for (const u of old) {
  const bikes = (await q(`select "photoKey" from "Bike" where "userId" = $1`, [u.id])).rows;
  for (const k of [u.pk, ...bikes.map((b) => b.photoKey)]) if (k) await rm(`.data/photos/${k}`, { force: true });
  await q(`delete from "Profile" where "userId" = $1`, [u.id]);
  await q(`delete from "User" where id = $1`, [u.id]);
}

async function picture(kind, label, hue) {
  const [w, h] = kind === "face" ? [600, 600] : [1200, 900];
  const shape = kind === "face"
    ? `<circle cx="300" cy="235" r="110" fill="hsl(${hue} 30% 78%)"/><path d="M90 600 C90 430 510 430 510 600 Z" fill="hsl(${hue} 30% 78%)"/>`
    : `<circle cx="330" cy="620" r="150" fill="none" stroke="hsl(${hue} 30% 82%)" stroke-width="34"/><circle cx="880" cy="620" r="150" fill="none" stroke="hsl(${hue} 30% 82%)" stroke-width="34"/><path d="M330 620 L520 400 L760 400 L880 620 M520 400 L470 320 L400 320 M760 400 L800 330" fill="none" stroke="hsl(${hue} 30% 82%)" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><rect x="520" y="350" width="220" height="70" rx="30" fill="hsl(${hue} 55% 55%)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="hsl(${hue} 35% 28%)"/>${shape}<text x="${w / 2}" y="${h - 28}" text-anchor="middle" font-family="Helvetica, Arial" font-size="${kind === "face" ? 30 : 38}" fill="hsl(${hue} 30% 88%)">${label} · exemplo</text></svg>`;
  const key = `${randomUUID()}.jpg`;
  await writeFile(`.data/photos/${key}`, await sharp(Buffer.from(svg)).jpeg({ quality: 84 }).toBuffer());
  return key;
}

const admin = (await q(`select id from "User" where role = 'ADMIN' limit 1`)).rows[0].id;
const people = [
  { slug: "bruna", name: "Bruna Tavares de Albuquerque", nick: "Bru", insta: "bru.scrambler", phone: "21987651234", face: 18, size: "P",
    region: "ZONA_SUL", exp: "ROAD_AND_DIRT", bio: "Scrambler 1200 XE, serra aos sábados e terra sempre que dá. Café bom no destino é obrigatório.", bday: [21, 11], since: "2024-03-09",
    em: ["Marcos Tavares (marido)", "21999990001", "O+", "Helena Albuquerque (mãe)", "21999990002", "Bradesco Saúde", "882 771 000123 45", "Alergia a dipirona e a frutos do mar. Asma leve, usa bombinha."],
    bikes: [
      { model: "Scrambler 1200 XE", cc: 1200, year: 2023, color: "Verde Matt Khaki", nick: "Jabuticaba", range: 300, photo: 140, mods: [["EXHAUST", "Zard alto 2 em 1, titânio"], ["LUGGAGE", "Bagageiro SW-Motech"], ["LUGGAGE", "Alforje lateral Kriega OS-18"], ["TYRES", "Pirelli Scorpion Rally STR"], ["PROTECTION", "Protetor de cárter em alumínio"], ["PROTECTION", "Protetor de mão Barkbusters"], ["LIGHTING", "Faróis auxiliares Denali D2"], ["OTHER", "Banco comfort Triumph"]] },
      { model: "Scrambler 400 X", cc: 400, year: 2025, color: "Preta", nick: "Formiga", range: 320, photo: 200, mods: [["TYRES", "Metzeler Karoo Street"], ["OTHER", "Suporte de celular Quad Lock"]] },
    ] },
  { slug: "caio", name: "Caio Mendes", nick: null, insta: "caiomendes.rj", phone: "21976543210", face: 205, size: "G",
    region: "NITEROI", exp: "ROAD", bio: "Vim da custom, fiquei na Scrambler. Topo qualquer estrada com curva.", bday: [3, 11], since: "2025-08-17",
    em: ["Renata Mendes (irmã)", "21999990003", "A-", null, null, "Unimed Rio", null, null],
    bikes: [{ model: "Scrambler 900", cc: 900, year: 2022, color: "Carnival Red", nick: null, range: 260, photo: 5, mods: [["EXHAUST", "Vance & Hines alto"], ["PROTECTION", "Slider de motor"], ["LIGHTING", "Pisca em LED"]] }] },
  { slug: "dandara", name: "Dandara Oliveira", nick: "Danda", insta: null, phone: "21965432109", face: null, size: "M",
    region: "ZONA_NORTE", exp: "STARTING", bio: null, bday: null, since: "2026-10-02",
    em: ["Lúcia Oliveira (mãe)", "21999990004", null, null, null, null, null, null],
    bikes: [{ model: "Scrambler 400 XC", cc: 400, year: 2026, color: "Amarela", nick: null, range: null, photo: null, mods: [["PROTECTION", "Protetor de carenagem"]] }] },
  { slug: "edu", name: "Eduardo Paranhos", nick: null, insta: null, phone: "21954321098", face: null, size: null,
    region: null, exp: null, bio: null, bday: null, since: "2026-11-10", em: null,
    bikes: [{ model: "Street Scrambler", cc: 900, year: null, color: null, nick: null, range: null, photo: null, mods: [] }] },
  { slug: "fernando", name: "Fernando Augusto Vasconcellos Brandão", nick: "Vasco", insta: "vasco.ontheroad", phone: "21943210987", face: 280, size: "XGG",
    region: "OUTRA_CIDADE", exp: "ROAD_AND_DIRT", bio: "Moro em Petrópolis e desço para o Rio todo fim de semana. Dono da clássica do grupo e de uma que não é Scrambler.", bday: [29, 2], since: "2023-06-25",
    em: [null, null, "Não sei", null, null, null, null, "Hipertensão controlada."],
    bikes: [
      { model: "Scrambler 865", cc: 865, year: 2014, color: "Verde e creme", nick: "Vovó", range: 220, photo: 95, mods: [["EXHAUST", "Arrow 2 em 2"], ["OTHER", "Carburação Keihin FCR 39"]] },
      { model: "Bonneville T120", cc: 1200, year: 2020, color: "Azul Cobalto", nick: null, range: 280, photo: null, mods: [] },
      { model: "Scrambler 1200 X", cc: 1200, year: 2024, color: "Ash Grey", nick: "Tempestade", range: 310, photo: 320, mods: [["TYRES", "Michelin Anakee Wild"]] },
    ] },
  { slug: "gabi", name: "Gabriela Sá", nick: "Gabi", insta: "gabi.sa", phone: "21932109876", face: 330, size: "PP",
    region: "BAIXADA", exp: "ROAD", bio: "Primeira moto grande. Aprendendo a viajar.", bday: [14, 11], since: "2026-05-30", em: null,
    bikes: [{ model: "Scrambler 900", cc: 900, year: 2024, color: "Jet Black", nick: "Pantera", range: null, photo: 260, mods: [] }] },
];

for (const p of people) {
  const uid = "mock" + p.slug, rid = "mockreq" + p.slug, since = new Date(p.since + "T15:00:00Z");
  await q(`insert into "User" (id, name, email, role, "createdAt", "updatedAt") values ($1,$2,$3,'PARTICIPANT',$4,now())`, [uid, p.name, `mock-${p.slug}@teste.local`, since]);
  await q(`insert into "JoinRequest" (id, "userId", "fullName", whatsapp, "bikeModel", "engineSize", status, "createdAt", "decidedAt") values ($1,$2,$3,$4,$5,$6,'APPROVED',$7,$7)`, [rid, uid, p.name, p.phone, p.bikes[0].model, p.bikes[0].cc, since]);
  await q(`insert into "AccessDecision" (id, "joinRequestId", "authorId", kind, "createdAt") values ($1,$2,$3,'APPROVED',$4)`, ["mockdec" + p.slug, rid, admin, since]);
  let main = null;
  for (const [i, b] of p.bikes.entries()) {
    const bid = `mockbike${p.slug}${i}`;
    const key = b.photo === null ? null : await picture("bike", b.nick ?? b.model, b.photo);
    await q(`insert into "Bike" (id, "userId", model, "engineSize", year, color, nickname, "rangeKm", "photoKey", "createdAt") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [bid, uid, b.model, b.cc, b.year, b.color, b.nick, b.range, key, new Date(since.getTime() + i * 60000)]);
    for (const [j, [cat, text]] of b.mods.entries()) await q(`insert into "BikeMod" (id, "bikeId", category, description, "createdAt") values ($1,$2,$3,$4,$5)`, [`${bid}m${j}`, bid, cat, text, new Date(since.getTime() + j * 1000)]);
    main ??= bid;
  }
  const e = p.em ?? [];
  const face = p.face === null ? null : await picture("face", p.nick ?? p.name.split(" ")[0], p.face);
  await q(`insert into "Profile" ("userId", "fullName", nickname, instagram, whatsapp, "photoKey", "shirtSize", "emergencyName", "emergencyPhone", "bloodType", "emergencyName2", "emergencyPhone2", "healthPlan", "healthPlanCard", "healthNotes", region, experience, bio, "birthDay", "birthMonth", "mainBikeId", "updatedAt") values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,now())`,
    [uid, p.name, p.nick, p.insta, p.phone, face, p.size, e[0] ?? null, e[1] ?? null, e[2] ?? null, e[3] ?? null, e[4] ?? null, e[5] ?? null, e[6] ?? null, e[7] ?? null, p.region, p.exp, p.bio, p.bday?.[0] ?? null, p.bday?.[1] ?? null, main]);
}
// algumas respostas de presença, para as listas dos passeios
const rides = (await q(`select id, status from "Ride" where status <> 'CANCELLED'`)).rows;
for (const r of rides) for (const [slug, answer] of [["bruna", "GOING"], ["caio", "GOING"], ["gabi", "NOT_GOING"], ["fernando", "GOING"]])
  await q(`insert into "RideResponse" ("rideId", "userId", answer, "updatedAt") values ($1,$2,$3,now()) on conflict do nothing`, [r.id, "mock" + slug, answer]);
console.log("criados:", people.map((p) => `${p.nick ?? p.name.split(" ")[0]} (mock${p.slug})`).join(", "));
await c.end();
