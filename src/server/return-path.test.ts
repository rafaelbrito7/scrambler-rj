import { describe, expect, it } from "vitest";

import { safeReturnPath } from "@/server/return-path";

describe("destino depois de entrar", () => {
  it("aceita a página de uma campanha de vestuário ou de um passeio", () => {
    expect(safeReturnPath("/vestuario/cmwkrjnf20003pbi9")).toBe("/vestuario/cmwkrjnf20003pbi9");
    expect(safeReturnPath("/passeios/cmwkvso640000z2i9")).toBe("/passeios/cmwkvso640000z2i9");
  });

  it("recusa endereços de fora, do painel ou com truques de caminho", () => {
    const rejected = [
      null,
      undefined,
      "",
      "https://exemplo.com/vestuario/abc",
      "//exemplo.com/vestuario/abc",
      "/painel/vestuario/abc",
      "/vestuario/abc/../../painel",
      "/vestuario/abc?x=1",
      "/vestuario/",
      "vestuario/abc",
      "/passeios/abc\nLocation: https://exemplo.com",
    ];

    for (const candidate of rejected) expect(safeReturnPath(candidate)).toBeNull();
  });
});
