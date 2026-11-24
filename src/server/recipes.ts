import type { AccessService } from "@/server/access";
import { BatchError, type BatchInput, validateGarment } from "@/server/batches";
import type { Database } from "@/server/db";

export type RecipeSummary = {
  id: string;
  model: string;
  unitPriceCents: number;
  sizes: string[];
  colors: { name: string; photoKey: string }[];
  updatedAt: Date;
};

const recipeInclude = {
  colors: { orderBy: { position: "asc" }, select: { name: true, photoKey: true } },
} as const;

// A recipe is the reusable description of a garment. Opening a batch copies its values, so
// the two never share a row: changing one leaves the other as it was.
export function createRecipeService(db: Database, access: Pick<AccessService, "getAccess">) {
  async function assertAdmin(userId: string) {
    const viewer = await access.getAccess(userId);

    if (!viewer.isAdmin) throw new BatchError("FORBIDDEN");
  }

  function summarize(recipe: Awaited<ReturnType<typeof findRecipes>>[number]): RecipeSummary {
    return {
      id: recipe.id,
      model: recipe.model,
      unitPriceCents: recipe.unitPriceCents,
      sizes: recipe.sizes,
      colors: recipe.colors,
      updatedAt: recipe.updatedAt,
    };
  }

  function findRecipes() {
    return db.recipe.findMany({ orderBy: { model: "asc" }, include: recipeInclude });
  }

  async function createRecipe(adminId: string, input: BatchInput) {
    await assertAdmin(adminId);

    const valid = validateGarment(input);
    const recipe = await db.recipe.create({
      data: {
        model: valid.model,
        unitPriceCents: valid.unitPriceCents,
        sizes: valid.sizes,
        createdById: adminId,
        colors: { create: valid.colors.map((color, position) => ({ ...color, position })) },
      },
      include: recipeInclude,
    });

    return summarize(recipe);
  }

  async function updateRecipe(adminId: string, recipeId: string, input: BatchInput) {
    await assertAdmin(adminId);

    const valid = validateGarment(input);

    await db.$transaction(async (tx) => {
      const exists = await tx.recipe.count({ where: { id: recipeId } });

      if (exists === 0) throw new BatchError("NOT_FOUND");

      await tx.recipeColor.deleteMany({ where: { recipeId } });
      await tx.recipe.update({
        where: { id: recipeId },
        data: {
          model: valid.model,
          unitPriceCents: valid.unitPriceCents,
          sizes: valid.sizes,
          colors: { create: valid.colors.map((color, position) => ({ ...color, position })) },
        },
      });
    });
  }

  async function listRecipes(adminId: string) {
    await assertAdmin(adminId);

    return (await findRecipes()).map(summarize);
  }

  async function getRecipe(adminId: string, recipeId: string) {
    await assertAdmin(adminId);

    const recipe = await db.recipe.findUnique({ where: { id: recipeId }, include: recipeInclude });

    if (!recipe) throw new BatchError("NOT_FOUND");

    return summarize(recipe);
  }

  return { createRecipe, updateRecipe, listRecipes, getRecipe };
}

export type RecipeService = ReturnType<typeof createRecipeService>;
