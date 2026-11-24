import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { renderBatchReportPdf } from "@/server/batch-report-pdf";
import type { BatchReport } from "@/server/orders";

function buildReport(orderCount: number): BatchReport {
  const orders = Array.from({ length: orderCount }, (_unused, index) => ({
    participantName: `Rider ${String(index + 1).padStart(3, "0")}`,
    items: [
      { colorName: "Preta", size: "M", quantity: 2 },
      { colorName: "Creme", size: "G", quantity: 1 },
    ],
    pieces: 3,
    totalCents: 24000,
    paymentStatus: index % 2 === 0 ? ("PAID" as const) : ("PENDING" as const),
  }));

  return {
    model: "Camiseta Mirante",
    status: "CLOSED",
    unitPriceCents: 8000,
    coverPhotoKey: null,
    orders,
    production: {
      sizes: ["M", "G"],
      rows: [
        { colorId: "a", colorName: "Preta", quantities: [orderCount * 2, 0], total: orderCount * 2 },
        { colorId: "b", colorName: "Creme", quantities: [0, orderCount], total: orderCount },
      ],
      sizeTotals: [orderCount * 2, orderCount],
      totalPieces: orderCount * 3,
      paidCents: Math.ceil(orderCount / 2) * 24000,
      pendingCents: Math.floor(orderCount / 2) * 24000,
      totalCents: orderCount * 24000,
    },
  };
}

async function render(orderCount: number) {
  const logo = await readFile(path.join(process.cwd(), "src", "app", "icon.png"));
  const pdf = await renderBatchReportPdf({
    report: buildReport(orderCount),
    generatedAt: new Date("2026-11-17T15:00:00Z"),
    logoDataUri: `data:image/png;base64,${logo.toString("base64")}`,
    photoDataUri: null,
  });
  const outputPath = process.env.PDF_SAMPLE_DIR;

  if (outputPath) await writeFile(path.join(outputPath, `vestuario-${orderCount}.pdf`), pdf);

  return pdf;
}

function countPages(pdf: Buffer) {
  return pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
}

describe("PDF da campanha", () => {
  it("cabe numa página com poucos pedidos", async () => {
    const pdf = await render(4);

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(countPages(pdf)).toBe(1);
  });

  it("pagina uma campanha longa em vez de cortar a lista", async () => {
    expect(countPages(await render(90))).toBeGreaterThan(2);
  });

  it("gera o documento mesmo sem nenhum pedido", async () => {
    expect(countPages(await render(0))).toBe(1);
  });
});
