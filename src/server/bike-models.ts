// The Scrambler models the group rides, shared by the server and the browser forms. Keep this
// file free of server-only imports. Changing the list is a code change, and the same names
// are written by the data migration that sorted the bikes registered as free text.
export const BIKE_MODELS = [
  { name: "Scrambler 400 X", engineSize: 400 },
  { name: "Scrambler 400 XC", engineSize: 400 },
  { name: "Scrambler 900", engineSize: 900 },
  { name: "Street Scrambler", engineSize: 900 },
  { name: "Scrambler 1200 X", engineSize: 1200 },
  { name: "Scrambler 1200 XC", engineSize: 1200 },
  { name: "Scrambler 1200 XE", engineSize: 1200 },
  { name: "Scrambler 865", engineSize: 865 },
];

export type BikeModel = (typeof BIKE_MODELS)[number];

// "Triumph Scrambler 900cc" and "scrambler900" are the same bike; "Scrambler 1200" is not
// any single one of the three 1200s.
function simplify(text: string) {
  return text.toLowerCase().replace(/triumph|cc|[^a-z0-9]/g, "");
}

const modelsBySpelling = new Map<string, BikeModel>(
  BIKE_MODELS.flatMap((model) => [
    [simplify(model.name), model],
    [simplify(`${model.name} ${model.engineSize}`), model],
  ]),
);

// The listed model a piece of text names without ambiguity, if any.
export function matchBikeModel(text: string): BikeModel | null {
  return modelsBySpelling.get(simplify(text)) ?? null;
}

// A listed model always carries its own engine size; anything else keeps what was typed.
export function resolveBike(model: string, engineSize: string) {
  const listed = matchBikeModel(model);

  return listed
    ? { model: listed.name, engineSize: String(listed.engineSize), isListed: true }
    : { model: model.trim(), engineSize: engineSize.trim(), isListed: false };
}

type DescribedBike = {
  engineSize: number;
  year: number | null;
  color: string | null;
  rangeKm: number | null;
};

// The one-line summary under a bike's name, wherever bikes are listed.
export function describeBike(bike: DescribedBike) {
  const range = bike.rangeKm ? `${bike.rangeKm} km de autonomia` : null;

  return [`${bike.engineSize} cilindradas`, bike.year, bike.color, range].filter(Boolean).join(" · ");
}

// What riders bolt onto their bikes, in the order the groups are shown.
export const MOD_CATEGORIES = [
  { value: "EXHAUST", label: "Escape" },
  { value: "LUGGAGE", label: "Bagagem" },
  { value: "TYRES", label: "Pneus" },
  { value: "PROTECTION", label: "Proteção" },
  { value: "LIGHTING", label: "Iluminação" },
  { value: "OTHER", label: "Outro" },
];

export const MAX_MODS_PER_BIKE = 20;
export const MOD_DESCRIPTION_MAX_LENGTH = 80;

export type ModItem = { id: string; category: string; description: string };

// Items grouped under their category, categories in list order, empty ones left out.
export function groupMods(mods: ModItem[]) {
  return MOD_CATEGORIES.map((category) => ({
    ...category,
    items: mods.filter((mod) => mod.category === category.value),
  })).filter((group) => group.items.length > 0);
}
