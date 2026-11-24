import type { GarmentInitial } from "@/components/app/garment-form";
import type { BatchSummary } from "@/server/batches";
import type { RecipeSummary } from "@/server/recipes";

type Garment = Pick<RecipeSummary | BatchSummary, "model" | "unitPriceCents" | "sizes" | "colors">;

// The form starts from a copy of a recipe or of an earlier campaign, with the price written
// the way people type it.
export function toGarmentInitial(recipe: Garment): GarmentInitial {
  const reais = Math.floor(recipe.unitPriceCents / 100);
  const cents = String(recipe.unitPriceCents % 100).padStart(2, "0");

  return {
    model: recipe.model,
    unitPrice: `${reais},${cents}`,
    sizes: recipe.sizes,
    colors: recipe.colors,
  };
}
