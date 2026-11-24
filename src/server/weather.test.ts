import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { createRideService, type RideInput } from "@/server/rides";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";
import {
  createWeatherService,
  readOpenMeteo,
  skyOf,
  type WeatherPoint,
  type WeatherProvider,
} from "@/server/weather";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });

// Saturday 12 December, leaving at 7h30 in Rio.
const sevenDaysBefore = new Date("2026-12-05T10:30:00Z");
let clock = sevenDaysBefore;
const rides = createRideService(db, access, () => clock);

const bike = { whatsapp: "(21) 98888-7777", bikeModel: "Scrambler 900", engineSize: "900" };

const meeting = { kind: "MEETING", name: "Posto Shell", place: "", time: "", note: "", lat: "-22.79", lon: "-43.32" };
const lunch = { kind: "DESTINATION", name: "Almoço em Itaipava", place: "", time: "12:00", note: "", lat: "-22.5", lon: "-43.18" };

const serra: RideInput = {
  route: "Serra de Petrópolis",
  description: "",
  date: "2026-12-12",
  meetingTime: "",
  departureTime: "07:30",
  returnTime: "16:30",
  mapUrl: "",
  photoKey: null,
  distanceKm: "142",
  surface: "PAVED",
  difficulty: "MODERATE",
  rideTime: "",
  tolls: "",
  tipIds: [],
  packingNote: "",
  planB: "",
  stops: [meeting, lunch],
};

// Answers by latitude, so the meeting point and the destination can be told apart, and counts
// how often it is asked.
function fakeProvider() {
  const asked: WeatherPoint[] = [];
  let isDown = false;
  const provider: WeatherProvider = {
    async forecast(point) {
      asked.push(point);

      if (isDown) throw new Error("fora do ar");

      return point.lat < -22.6
        ? { temperatureC: 24.4, rainChance: 20, weatherCode: 2 }
        : { temperatureC: 18.6, rainChance: 70, weatherCode: 61 };
    },
  };

  return { provider, asked, goDown: () => (isDown = true) };
}

async function setup(input: RideInput = serra) {
  clock = sevenDaysBefore;

  const admin = await db.user.create({ data: { email: "chefe@exemplo.com" } });

  await access.submitJoinRequest(admin.id, { ...bike, fullName: "Chefe Lima" });

  const { id } = await rides.publishRide(admin.id, input);
  const fake = fakeProvider();
  const weather = createWeatherService(access, rides, fake.provider, () => clock);

  return { admin, id, weather, ...fake };
}

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("previsão do tempo do passeio", () => {
  it("mostra o encontro na hora da saída e o destino na hora dele, a sete dias do passeio", async () => {
    const { admin, id, weather, asked } = await setup();

    expect(await weather.getRideForecast(admin.id, id)).toEqual([
      { label: "Encontro", place: "Posto Shell", at: new Date("2026-12-12T10:30:00Z"), temperatureC: 24, rainChance: 20, sky: "partly" },
      { label: "Destino", place: "Almoço em Itaipava", at: new Date("2026-12-12T15:00:00Z"), temperatureC: 19, rainChance: 70, sky: "rain" },
    ]);
    expect(asked.map((point) => point.at)).toEqual([
      new Date("2026-12-12T10:30:00Z"),
      new Date("2026-12-12T15:00:00Z"),
    ]);
  });
});

describe("quando a previsão aparece", () => {
  it("não aparece a mais de sete dias, e não consulta o serviço", async () => {
    const { admin, id, weather, asked } = await setup();

    clock = new Date("2026-12-05T10:29:00Z");

    expect(await weather.getRideForecast(admin.id, id)).toBeNull();
    expect(asked).toEqual([]);
  });

  it("não aparece depois que o passeio saiu nem em passeio cancelado", async () => {
    const { admin, id, weather } = await setup();

    clock = new Date("2026-12-12T10:30:00Z");

    expect(await weather.getRideForecast(admin.id, id)).toBeNull();

    clock = sevenDaysBefore;
    await rides.cancelRide(admin.id, id);

    expect(await weather.getRideForecast(admin.id, id)).toBeNull();
  });

  it("deixa de fora a parada sem ponto no mapa e o destino sem horário", async () => {
    const noPin = await setup({ ...serra, stops: [{ ...meeting, lat: "", lon: "" }, lunch] });

    expect((await noPin.weather.getRideForecast(noPin.admin.id, noPin.id))?.map((point) => point.label)).toEqual([
      "Destino",
    ]);

    await resetDatabase(db);

    const noTime = await setup({ ...serra, stops: [meeting, { ...lunch, time: "" }] });

    expect((await noTime.weather.getRideForecast(noTime.admin.id, noTime.id))?.map((point) => point.label)).toEqual([
      "Encontro",
    ]);
  });

  it("sem nenhuma parada com ponto no mapa não há previsão nem consulta", async () => {
    const { admin, id, weather, asked } = await setup({
      ...serra,
      stops: [{ ...meeting, lat: "", lon: "" }],
    });

    expect(await weather.getRideForecast(admin.id, id)).toBeNull();
    expect(asked).toEqual([]);
  });

  it("com o serviço fora do ar não há previsão, e nada quebra", async () => {
    const { admin, id, weather, goDown } = await setup();

    goDown();

    expect(await weather.getRideForecast(admin.id, id)).toBeNull();
  });

  it("não mostra a quem não está no grupo", async () => {
    const { id, weather } = await setup();
    const outsider = await db.user.create({ data: { email: "fora@exemplo.com" } });

    await expect(weather.getRideForecast(outsider.id, id)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("guardar a previsão", () => {
  it("reaproveita o que consultou por três horas e depois consulta de novo", async () => {
    const { admin, id, weather, asked } = await setup();

    await weather.getRideForecast(admin.id, id);
    clock = new Date(sevenDaysBefore.getTime() + 2 * 60 * 60 * 1000 + 59 * 60 * 1000);
    await weather.getRideForecast(admin.id, id);

    expect(asked).toHaveLength(2);

    clock = new Date(sevenDaysBefore.getTime() + 3 * 60 * 60 * 1000);
    await weather.getRideForecast(admin.id, id);

    expect(asked).toHaveLength(4);
  });

  it("não guarda uma falha: tenta de novo na visita seguinte", async () => {
    const asked: WeatherPoint[] = [];
    const { admin, id } = await setup();
    let isDown = true;
    const weather = createWeatherService(
      access,
      rides,
      {
        async forecast(point) {
          asked.push(point);

          return isDown ? null : { temperatureC: 20, rainChance: 0, weatherCode: 0 };
        },
      },
      () => clock,
    );

    expect(await weather.getRideForecast(admin.id, id)).toBeNull();

    isDown = false;

    expect(await weather.getRideForecast(admin.id, id)).toHaveLength(2);
    expect(asked).toHaveLength(4);
  });
});

describe("ler a resposta do Open-Meteo", () => {
  const answer = {
    hourly: {
      time: ["2026-12-12T06:00", "2026-12-12T07:00", "2026-12-12T08:00"],
      temperature_2m: [25.5, 26.3, 27.5],
      precipitation_probability: [29, 22, null],
      weather_code: [3, 61, 0],
    },
  };

  it("pega a hora pedida", () => {
    expect(readOpenMeteo(answer, "2026-12-12T07:00")).toEqual({ temperatureC: 26.3, rainChance: 22, weatherCode: 61 });
  });

  it("não inventa valor para hora ausente, dado faltando ou resposta de erro", () => {
    expect(readOpenMeteo(answer, "2026-12-12T09:00")).toBeNull();
    expect(readOpenMeteo(answer, "2026-12-12T08:00")).toBeNull();
    expect(readOpenMeteo({}, "2026-12-12T07:00")).toBeNull();
  });
});

describe("céu em uma palavra", () => {
  it.each([
    [0, "clear"],
    [1, "partly"],
    [2, "partly"],
    [3, "cloudy"],
    [45, "fog"],
    [48, "fog"],
    [51, "rain"],
    [61, "rain"],
    [82, "rain"],
    [95, "storm"],
    [99, "storm"],
  ])("código %i é %s", (code, sky) => {
    expect(skyOf(code)).toBe(sky);
  });
});
