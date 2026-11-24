import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredPhoto = {
  bytes: Uint8Array;
  contentType: string;
};

// The rest of the app only knows photo keys, so the disk can be swapped for a hosted
// bucket without touching batches or screens.
export type PhotoStorage = {
  save(photo: StoredPhoto): Promise<string>;
  read(key: string): Promise<StoredPhoto | null>;
  remove(key: string): Promise<void>;
};

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const typeByExtension = Object.fromEntries(
  Object.entries(extensionByType).map(([type, extension]) => [extension, type]),
);

const keyPattern = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function isAcceptedPhotoType(contentType: string) {
  return contentType in extensionByType;
}

export function createDiskPhotoStorage(directory: string): PhotoStorage {
  function pathFor(key: string) {
    return keyPattern.test(key) ? path.join(directory, key) : null;
  }

  return {
    async save(photo) {
      const extension = extensionByType[photo.contentType];

      if (!extension) throw new Error(`Tipo de foto não aceito: ${photo.contentType}`);

      const key = `${randomUUID()}.${extension}`;

      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, key), photo.bytes);

      return key;
    },

    async read(key) {
      const filePath = pathFor(key);

      if (!filePath) return null;

      try {
        const bytes = await readFile(filePath);

        return { bytes, contentType: typeByExtension[key.split(".")[1]] };
      } catch {
        return null;
      }
    },

    async remove(key) {
      const filePath = pathFor(key);

      if (filePath) await rm(filePath, { force: true });
    },
  };
}
