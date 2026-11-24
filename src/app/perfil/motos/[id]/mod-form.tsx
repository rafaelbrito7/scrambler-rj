"use client";

import { useActionState, useState } from "react";

import { type ModFormState, saveBikeMod } from "@/app/perfil/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MOD_CATEGORIES, MOD_DESCRIPTION_MAX_LENGTH, type ModItem } from "@/server/bike-models";

type ModFormProps = { bikeId: string; editing?: ModItem };

export function ModForm({ bikeId, editing }: ModFormProps) {
  const initialState: ModFormState = {
    values: { category: editing?.category ?? "", description: editing?.description ?? "" },
    fieldErrors: {},
    formError: null,
    attempt: 0,
  };
  const [state, formAction, isPending] = useActionState(saveBikeMod, initialState);
  const [category, setCategory] = useState(state.values.category);
  const isEditing = editing !== undefined;
  const categoryError = state.fieldErrors.category;
  const descriptionError = state.fieldErrors.description;
  const hasCategoryError = Boolean(categoryError);
  const hasDescriptionError = Boolean(descriptionError);
  const hasFormError = state.formError !== null;
  const selected = category ? [category] : [];
  const idleLabel = isEditing ? "Salvar item" : "Incluir item";

  return (
    <form action={formAction} noValidate className="mt-6">
      <input type="hidden" name="bikeId" value={bikeId} />
      {isEditing && <input type="hidden" name="modId" value={editing.id} />}
      <input type="hidden" name="category" value={category} />

      <FieldGroup>
        {hasFormError && <Alert variant="destructive">{state.formError}</Alert>}

        <Field data-invalid={hasCategoryError}>
          <FieldLabel id="category-label">Categoria</FieldLabel>
          <ToggleGroup
            variant="outline"
            value={selected}
            onValueChange={([next]) => setCategory(next ?? "")}
            aria-labelledby="category-label"
          >
            {MOD_CATEGORIES.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {hasCategoryError && <FieldError>{categoryError}</FieldError>}
        </Field>

        <Field data-invalid={hasDescriptionError}>
          <FieldLabel htmlFor="description">O que é</FieldLabel>
          <Input
            key={state.attempt}
            id="description"
            name="description"
            autoComplete="off"
            maxLength={MOD_DESCRIPTION_MAX_LENGTH}
            placeholder="Escape Zard alto"
            defaultValue={state.values.description}
            aria-invalid={hasDescriptionError}
            aria-describedby="description-hint"
          />
          <FieldDescription id="description-hint">
            Marca e modelo, em até {MOD_DESCRIPTION_MAX_LENGTH} caracteres. Todo o grupo vê.
          </FieldDescription>
          {hasDescriptionError && <FieldError>{descriptionError}</FieldError>}
        </Field>

        <Button type="submit" variant="outline" disabled={isPending} className="w-full sm:w-fit">
          {isPending ? "Salvando…" : idleLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
