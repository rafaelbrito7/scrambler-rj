import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { renderBatchReportPdf } from "@/server/batch-report-pdf";
import { OrderError } from "@/server/orders";
import { orders, photos } from "@/server/services";
import { getViewer } from "@/server/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toDataUri(bytes: Uint8Array, mediaType: string) {
  return `data:${mediaType};base64,${Buffer.from(bytes).toString("base64")}`;
}

// The PDF renderer only reads PNG and JPEG, and stored photos may be WebP.
async function loadPhoto(photoKey: string | null) {
  const photo = photoKey ? await photos.read(photoKey) : null;

  if (!photo) return null;

  const jpeg = await sharp(photo.bytes).rotate().resize({ width: 480 }).jpeg({ quality: 82 }).toBuffer();

  return toDataUri(jpeg, "image/jpeg");
}

function fileNameFor(model: string, generatedAt: Date) {
  const slug = model
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `vestuario-${slug || "scrambler-rj"}-${generatedAt.toISOString().slice(0, 10)}.pdf`;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const viewer = await getViewer();

  if (!viewer?.isAdmin) return new Response(null, { status: 404 });

  const { id } = await params;
  const generatedAt = new Date();

  try {
    const report = await orders.getBatchReport(viewer.userId, id);
    const [logo, photoDataUri] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "app", "icon.png")),
      loadPhoto(report.coverPhotoKey),
    ]);
    const pdf = await renderBatchReportPdf({
      report,
      generatedAt,
      logoDataUri: toDataUri(logo, "image/png"),
      photoDataUri,
    });

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileNameFor(report.model, generatedAt)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof OrderError) return new Response(null, { status: 404 });

    throw error;
  }
}
