"use client";

import { useActionState } from "react";

import { type BikeFormState, saveBike } from "@/app/perfil/actions";
import { PhotoField } from "@/app/perfil/editar/photo-field";
import { BikeModelField } from "@/components/app/bike-model-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { BikeField, BikeInput } from "@/server/profiles";

type FieldConfig = {
  name: BikeField;
  label: string;
  placeholder: string;
  hint?: string;
  inputMode?: "numeric";
  isNarrow?: boolean;
};

const fields: FieldConfig[] = [
  { name: "year", label: "Ano", placeholder: "2023", hint: "Opcional.", inputMode: "numeric", isNarrow: true },
  { name: "color", label: "Cor", placeholder: "Verde", hint: "Opcional." },
  { name: "nickname", label: "Apelido da moto", placeholder: "Tangerina", hint: "Opcional." },
  {
    name: "rangeKm",
    label: "Autonomia",
    placeholder: "280",
    hint: "Opcional. Quilômetros com um tanque; ajuda a planejar abastecimento nos passeios.",
    inputMode: "numeric",
    isNarrow: true,
  },
];

type BikeFormProps = {
  initial: BikeInput;
  bikeId?: string;
  submitLabel: string;
  hasPhoto: boolean;
  currentPhoto?: React.ReactNode;
};

export function BikeForm({ initial, bikeId, submitLabel, hasPhoto, currentPhoto }: BikeFormProps) {
  const initialState: BikeFormState = {
    values: initial,
    fieldErrors: {},
    formError: null,
    attempt: 0,
  };
  const [state, formAction, isPending] = useActionState(saveBike, initialState);
  const hasFormError = state.formError !== null;
  const isEditing = bikeId !== undefined;

  return (
    <form action={formAction} noValidate className="mt-8 max-w-xl">
      {isEditing && <input type="hidden" name="bikeId" value={bikeId} />}

      <FieldGroup>
        {hasFormError && <Alert variant="destructive">{state.formError}</Alert>}

        <BikeModelField
          modelName="model"
          engineName="engineSize"
          initialModel={state.values.model}
          initialEngine={state.values.engineSize}
          modelError={state.fieldErrors.model}
          engineError={state.fieldErrors.engineSize}
        />

        {fields.map((field) => {
          const error = state.fieldErrors[field.name];
          const hasError = Boolean(error);
          const hasHint = Boolean(field.hint);
          const describedBy = [
            hasHint ? `${field.name}-hint` : null,
            hasError ? `${field.name}-error` : null,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Field key={field.name} data-invalid={hasError}>
              <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                inputMode={field.inputMode}
                autoComplete="off"
                placeholder={field.placeholder}
                defaultValue={state.values[field.name]}
                aria-invalid={hasError}
                aria-describedby={describedBy || undefined}
                className={field.isNarrow ? "sm:max-w-40" : undefined}
              />
              {hasHint && <FieldDescription id={`${field.name}-hint`}>{field.hint}</FieldDescription>}
              {hasError && <FieldError id={`${field.name}-error`}>{error}</FieldError>}
            </Field>
          );
        })}

        <PhotoField
          key={state.attempt}
          current={hasPhoto ? currentPhoto : null}
          hasPhoto={hasPhoto}
          error={state.fieldErrors.photo}
          hint="Opcional. Uma foto da moto, JPG, PNG ou WebP de até 5 MB. Todo o grupo vê."
          previewClassName="aspect-[4/3] w-40 rounded-sm"
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
          {isPending ? "Salvando…" : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
