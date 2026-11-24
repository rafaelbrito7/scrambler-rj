import { type BatchColorInput, type BatchFieldErrors, MAX_BATCH_COLORS } from "@/server/batches";
import { isAcceptedPhotoType, MAX_PHOTO_BYTES } from "@/server/photo-storage";
import { photos } from "@/server/services";

export type GarmentFormState = {
  values: { model: string; unitPrice: string; sizes: string[] };
  fieldErrors: BatchFieldErrors;
  attempt: number;
};

type GarmentFormData =
  | { ok: false; state: GarmentFormState }
  | {
      ok: true;
      values: GarmentFormState["values"];
      colors: BatchColorInput[];
      // Photos saved during this request; removed again if the garment is refused.
      discardUploads: () => Promise<void>;
    };

// Reads the garment form shared by "open batch" and the recipe screens. A colour keeps a
// photo it already had only when that key is in `reusableKeys`; otherwise it needs an upload.
export async function readGarmentForm(
  formData: FormData,
  attempt: number,
  reusableKeys: Set<string>,
): Promise<GarmentFormData> {
  const values = {
    model: String(formData.get("model") ?? ""),
    unitPrice: String(formData.get("unitPrice") ?? ""),
    sizes: formData.getAll("sizes").map(String),
  };
  const names = formData.getAll("colorName").map(String);
  const uploads = formData.getAll("colorPhoto");
  const existingKeys = formData.getAll("colorPhotoKey").map(String);
  const files = names.map((_name, index) => {
    const entry = uploads[index];

    return entry instanceof File && entry.size > 0 ? entry : null;
  });
  const hasRejectedPhoto = files.some(
    (file) => file && (!isAcceptedPhotoType(file.type) || file.size > MAX_PHOTO_BYTES),
  );

  if (hasRejectedPhoto || names.length > MAX_BATCH_COLORS) {
    const colors = hasRejectedPhoto
      ? "Use fotos JPG, PNG ou WebP de até 5 MB."
      : `Use no máximo ${MAX_BATCH_COLORS} cores.`;

    return { ok: false, state: { values, fieldErrors: { colors }, attempt } };
  }

  const savedKeys: string[] = [];
  const colors: BatchColorInput[] = [];

  for (const [index, name] of names.entries()) {
    const file = files[index];
    const existingKey = existingKeys[index] ?? "";
    let photoKey = reusableKeys.has(existingKey) ? existingKey : null;

    if (file) {
      photoKey = await photos.save({
        bytes: new Uint8Array(await file.arrayBuffer()),
        contentType: file.type,
      });
      savedKeys.push(photoKey);
    }

    colors.push({ name, photoKey });
  }

  return {
    ok: true,
    values,
    colors,
    discardUploads: async () => {
      await Promise.all(savedKeys.map((key) => photos.remove(key)));
    },
  };
}
