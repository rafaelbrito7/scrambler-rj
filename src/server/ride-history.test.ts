import { describe, expect, it } from "vitest";

import { levelFor, monthOf, streaksFor } from "@/server/ride-history";

const mid = (month: string) => new Date(`${month}-15T12:00:00-03:00`);

describe("selo de nível", () => {
  it("não existe sem passeio", () => {
    expect(levelFor(0)).toBeNull();
  });

  it.each([
    [1, "Primeira saída", 4],
    [4, "Primeira saída", 1],
    [5, "Pegou estrada", 5],
    [9, "Pegou estrada", 1],
    [10, "Rodado", 15],
    [24, "Rodado", 1],
    [25, "Estradeiro", 25],
    [49, "Estradeiro", 1],
  ])("com %i passeios é %s e faltam %i para o próximo", (count, name, remaining) => {
    expect(levelFor(count)).toMatchObject({ name, next: { remaining } });
  });

  it("no último marco não há próximo", () => {
    expect(levelFor(50)).toEqual({ name: "Lenda da serra", next: null });
  });
});

describe("sequência de meses", () => {
  it("usa o calendário de Brasília na virada do mês", () => {
    expect(monthOf(new Date("2026-12-01T02:00:00Z"))).toBe("2026-11");
  });

  it("conta meses seguidos, atravessando o ano", () => {
    const months = ["2026-11", "2026-12", "2027-01"];

    expect(streaksFor(months, months, mid("2027-02"))).toEqual({ current: 3, best: 3 });
  });

  it("ignora mês em que o grupo não fez passeio", () => {
    const rider = ["2026-08", "2026-10"];

    expect(streaksFor(rider, rider, mid("2026-11"))).toEqual({ current: 2, best: 2 });
  });

  it("zera em mês com passeio do grupo e sem presença, guardando o recorde", () => {
    const group = ["2026-06", "2026-07", "2026-08", "2026-09"];

    expect(streaksFor(["2026-06", "2026-07", "2026-09"], group, mid("2026-10"))).toEqual({
      current: 1,
      best: 2,
    });
  });

  it("não zera no mês corrente enquanto ele não termina", () => {
    const group = ["2026-09", "2026-10", "2026-11"];

    expect(streaksFor(["2026-09", "2026-10"], group, mid("2026-11"))).toEqual({ current: 2, best: 2 });
  });

  it("soma o mês corrente quando a pessoa já rodou nele", () => {
    const months = ["2026-10", "2026-11"];

    expect(streaksFor(months, months, mid("2026-11"))).toEqual({ current: 2, best: 2 });
  });
});
