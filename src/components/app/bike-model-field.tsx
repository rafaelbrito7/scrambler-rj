"use client";

import { useState } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type ListedBikeModel, matchBikeModel } from "@/server/bike-models";

const OTHER = "outro";

type BikeModelFieldProps = {
  // The models on offer, in list order, as the server read them from the database.
  models: ListedBikeModel[];
  modelName: string;
  engineName: string;
  initialModel: string;
  initialEngine: string;
  modelError?: string;
  engineError?: string;
};

// One control for the bike in the join request and in the profile: pick a listed Scrambler,
// which brings its engine size, or say "Outro" and type both.
export function BikeModelField({
  models,
  modelName,
  engineName,
  initialModel,
  initialEngine,
  modelError,
  engineError,
}: BikeModelFieldProps) {
  const listed = matchBikeModel(models, initialModel);
  const initialChoice = listed?.name ?? (initialModel.trim() ? OTHER : "");
  const [choice, setChoice] = useState(initialChoice);
  const chosen = models.find((model) => model.name === choice);
  const isOther = choice === OTHER;
  const isListed = chosen !== undefined;
  const hasModelError = Boolean(modelError);
  const hasEngineError = Boolean(engineError);
  const showsGroupError = hasModelError && !isOther;
  const selected = choice ? [choice] : [];
  const emptyHint = isOther
    ? "Digite o modelo e a cilindrada abaixo."
    : "Escolha o modelo. Se o seu não está na lista, toque em Outro.";
  const hint = isListed ? `${chosen.engineSize} cilindradas.` : emptyHint;

  return (
    <>
      <Field data-invalid={showsGroupError}>
        <FieldLabel id={`${modelName}-label`}>Modelo da moto</FieldLabel>
        <ToggleGroup
          variant="outline"
          value={selected}
          onValueChange={([next]) => setChoice(next ?? "")}
          aria-labelledby={`${modelName}-label`}
          aria-describedby={`${modelName}-hint`}
        >
          {models.map((model) => (
            <ToggleGroupItem key={model.id} value={model.name}>
              {model.name}
            </ToggleGroupItem>
          ))}
          <ToggleGroupItem value={OTHER}>Outro</ToggleGroupItem>
        </ToggleGroup>
        <FieldDescription id={`${modelName}-hint`}>
          {hint}
        </FieldDescription>
        {showsGroupError && <FieldError>{modelError}</FieldError>}
        {!isOther && (
          <>
            <input type="hidden" name={modelName} value={chosen?.name ?? ""} />
            <input type="hidden" name={engineName} value="" />
          </>
        )}
      </Field>

      {isOther && (
        <>
          <Field data-invalid={hasModelError}>
            <FieldLabel htmlFor={modelName}>Qual modelo</FieldLabel>
            <Input
              id={modelName}
              name={modelName}
              autoComplete="off"
              placeholder="Scrambler 900 Chrome Edition"
              defaultValue={listed ? "" : initialModel}
              aria-invalid={hasModelError}
            />
            {hasModelError && <FieldError>{modelError}</FieldError>}
          </Field>
          <Field data-invalid={hasEngineError}>
            <FieldLabel htmlFor={engineName}>Cilindrada</FieldLabel>
            <Input
              id={engineName}
              name={engineName}
              inputMode="numeric"
              autoComplete="off"
              placeholder="900"
              defaultValue={listed ? "" : initialEngine}
              aria-invalid={hasEngineError}
              className="sm:max-w-40"
            />
            {hasEngineError && <FieldError>{engineError}</FieldError>}
          </Field>
        </>
      )}
    </>
  );
}
