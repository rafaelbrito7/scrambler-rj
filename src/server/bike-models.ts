// Pure pieces about bikes, shared by the server and the browser forms. Keep this file free of
// server-only imports. The list of models itself lives in the database, kept by administrators.

// The list the platform started with: what the first migration wrote and what tests reset to.
export const INITIAL_BIKE_MODELS = [
  { name: "Scrambler 400 X", engineSize: 400 },
  { name: "Scrambler 400 XC", engineSize: 400 },
  { name: "Scrambler 900", engineSize: 900 },
  { name: "Street Scrambler", engineSize: 900 },
  { name: "Scrambler 1200 X", engineSize: 1200 },
  { name: "Scrambler 1200 XC", engineSize: 1200 },
  { name: "Scrambler 1200 XE", engineSize: 1200 },
  { name: "Scrambler 865", engineSize: 865 },
];

export type ListedBikeModel = { id: string; name: string; engineSize: number };

// "Triumph Scrambler 900cc" and "scrambler900" are the same bike; "Scrambler 1200" is not
// any single one of the three 1200s.
function simplify(text: string) {
  return text.toLowerCase().replace(/triumph|cc|[^a-z0-9]/g, "");
}

// The ways people write a model: its name, with or without the engine size after it.
export function spellingsOf(model: { name: string; engineSize: number }) {
  return [simplify(model.name), simplify(`${model.name} ${model.engineSize}`)];
}

// The listed model a piece of text names without ambiguity, if any.
export function matchBikeModel(models: ListedBikeModel[], text: string): ListedBikeModel | null {
  const spelling = simplify(text);
  const named = models.filter((model) => spellingsOf(model).includes(spelling));

  return named.length === 1 ? named[0] : null;
}

// A listed model always carries its own engine size; anything else keeps what was typed.
export function resolveBike(models: ListedBikeModel[], model: string, engineSize: string) {
  const listed = matchBikeModel(models, model);

  return listed
    ? { model: listed.name, engineSize: String(listed.engineSize), listedModelId: listed.id }
    : { model: model.trim(), engineSize: engineSize.trim(), listedModelId: null };
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
