import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { createAccessService } from "@/server/access";
import { type BatchInput, createBatchService } from "@/server/batches";
import { createRecipeService, type RecipeSummary } from "@/server/recipes";
import { connectTestDatabase, resetDatabase } from "@/server/test-database";

const db = connectTestDatabase();
const access = createAccessService(db, { adminEmails: ["chefe@exemplo.com"] });
const batches = createBatchService(db, access);
const recipes = createRecipeService(db, access);

const bike = { whatsapp: "(21) 98888-7777", bikeModel: "Scrambler 900", engineSize: "900" };

const shirt: BatchInput = {
  model: "Camiseta Mirante",
  unitPrice: "80,00",
  sizes: ["M", "G"],
  colors: [
    { name: "Preta", photoKey: "preta.webp" },
    { name: "Creme", photoKey: "creme.webp" },
  ],
};

// What the "open from recipe" form sends: the recipe's values, free to be adjusted first.
function copyOf(recipe: RecipeSummary, changes: Partial<BatchInput> = {}): BatchInput {
  return {
    model: recipe.model,
    unitPrice: (recipe.unitPriceCents / 100).toFixed(2).replace(".", ","),
    sizes: recipe.sizes,
    colors: recipe.colors,
    ...changes,
  };
}

async function createAdmin() {
  const admin = await db.user.create({ data: { email: "chefe@exemplo.com" } });

  await access.submitJoinRequest(admin.id, { ...bike, fullName: "Chefe Lima" });

  return admin;
}

async function createParticipant(adminId: string) {
  const user = await db.user.create({ data: { email: "ana@exemplo.com" } });
  const request = await access.submitJoinRequest(user.id, { ...bike, fullName: "Ana Reis" });

  await access.decide(adminId, request.id, "approve");

  return user;
}

beforeEach(async () => {
  await resetDatabase(db);
});

afterAll(async () => {
  await resetDatabase(db);
  await db.$disconnect();
});

describe("template", () => {
  it("guarda modelo, preço, tamanhos e pares de cor e foto", async () => {
    const admin = await createAdmin();

    await recipes.createRecipe(admin.id, shirt);

    const [recipe] = await recipes.listRecipes(admin.id);

    expect(recipe).toMatchObject({
      model: "Camiseta Mirante",
      unitPriceCents: 8000,
      sizes: ["M", "G"],
      colors: [
        { name: "Preta", photoKey: "preta.webp" },
        { name: "Creme", photoKey: "creme.webp" },
      ],
    });
  });

  it("aplica as mesmas exigências de uma campanha", async () => {
    const admin = await createAdmin();
    const withoutPhoto = [{ name: "Preta", photoKey: null }];

    await expect(recipes.createRecipe(admin.id, { ...shirt, colors: withoutPhoto })).rejects.toMatchObject({
      code: "INVALID_INPUT",
      fieldErrors: { colors: expect.any(String) },
    });
    await expect(recipes.createRecipe(admin.id, { ...shirt, unitPrice: "0" })).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
    expect(await recipes.listRecipes(admin.id)).toEqual([]);
  });

  it("mantém cada campanha como foi aberta quando o template muda depois", async () => {
    const admin = await createAdmin();
    const recipe = await recipes.createRecipe(admin.id, shirt);
    const first = await batches.openBatch(admin.id, copyOf(recipe));
    const second = await batches.openBatch(
      admin.id,
      copyOf(recipe, { unitPrice: "95,00", sizes: ["G", "GG"] }),
    );

    await recipes.updateRecipe(admin.id, recipe.id, {
      model: "Camiseta Mirante 2",
      unitPrice: "120,00",
      sizes: ["P"],
      colors: [{ name: "Verde", photoKey: "verde.webp" }],
    });

    expect(await batches.getBatch(admin.id, first.id)).toMatchObject({
      model: "Camiseta Mirante",
      unitPriceCents: 8000,
      sizes: ["M", "G"],
    });
    expect((await batches.getBatch(admin.id, first.id)).colors.map((color) => color.name)).toEqual([
      "Preta",
      "Creme",
    ]);
    expect(await batches.getBatch(admin.id, second.id)).toMatchObject({
      model: "Camiseta Mirante",
      unitPriceCents: 9500,
      sizes: ["G", "GG"],
    });
    expect(await recipes.getRecipe(admin.id, recipe.id)).toMatchObject({
      model: "Camiseta Mirante 2",
      unitPriceCents: 12000,
      sizes: ["P"],
      colors: [{ name: "Verde", photoKey: "verde.webp" }],
    });
  });

  it("não muda o template quando a campanha aberta a partir dele é ajustado", async () => {
    const admin = await createAdmin();
    const recipe = await recipes.createRecipe(admin.id, shirt);
    const batch = await batches.openBatch(admin.id, copyOf(recipe));

    await batches.changeUnitPrice(admin.id, batch.id, "99,90");

    expect((await recipes.getRecipe(admin.id, recipe.id)).unitPriceCents).toBe(8000);
  });

  it("recusa edição inválida ou de template que não existe, sem perder o template", async () => {
    const admin = await createAdmin();
    const recipe = await recipes.createRecipe(admin.id, shirt);

    await expect(recipes.updateRecipe(admin.id, recipe.id, { ...shirt, sizes: [] })).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
    await expect(recipes.updateRecipe(admin.id, "inexistente", shirt)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect((await recipes.getRecipe(admin.id, recipe.id)).sizes).toEqual(["M", "G"]);
  });

  it("não deixa rider ver, criar nem editar templates", async () => {
    const admin = await createAdmin();
    const ana = await createParticipant(admin.id);
    const recipe = await recipes.createRecipe(admin.id, shirt);
    const forbidden = { name: "BatchError", code: "FORBIDDEN" };

    await expect(recipes.listRecipes(ana.id)).rejects.toMatchObject(forbidden);
    await expect(recipes.getRecipe(ana.id, recipe.id)).rejects.toMatchObject(forbidden);
    await expect(recipes.createRecipe(ana.id, shirt)).rejects.toMatchObject(forbidden);
    await expect(recipes.updateRecipe(ana.id, recipe.id, shirt)).rejects.toMatchObject(forbidden);
  });
});
