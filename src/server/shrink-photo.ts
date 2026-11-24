import sharp from "sharp";

import type { StoredPhoto } from "@/server/photo-storage";

// A phone photo comes in at several megabytes; the gallery keeps a JPEG whose longer side is
// at most 2000 pixels, turned the right way up.
export async function shrinkGalleryPhoto(photo: StoredPhoto): Promise<StoredPhoto> {
  const bytes = await sharp(photo.bytes)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  return { bytes: new Uint8Array(bytes), contentType: "image/jpeg" };
}
