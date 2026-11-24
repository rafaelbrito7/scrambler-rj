// The sizes a batch can offer, in the order they are always shown and stored.
export const GARMENT_SIZES = ["PP", "P", "M", "G", "GG", "XGG"];

// Kept beside the sizes because both are plain lists that browser code also needs; the
// profile service itself reaches for the disk and cannot be imported there.
export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Não sei"];

// The size saved in the profile is only a hint, and only when this batch offers it.
export function suggestSize(profileSize: string | null, batchSizes: string[]) {
  return profileSize && batchSizes.includes(profileSize) ? profileSize : null;
}
