"use client";

import { useActionState } from "react";

import { type JoinRequestFormState, submitJoinRequest } from "@/app/actions";
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
import type { JoinRequestField } from "@/server/access";

type FieldConfig = {
  name: JoinRequestField;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric";
  autoComplete?: string;
};

const fields: FieldConfig[] = [
  { name: "fullName", label: "Nome", autoComplete: "name" },
  {
    name: "whatsapp",
    label: "WhatsApp",
    hint: "Com DDD. Só os administradores veem.",
    placeholder: "(21) 98888-7777",
    type: "tel",
    inputMode: "tel",
    autoComplete: "tel-national",
  },
];

export function JoinRequestForm({ defaultName }: { defaultName: string }) {
  const initialState: JoinRequestFormState = {
    values: { fullName: defaultName, whatsapp: "", bikeModel: "", engineSize: "" },
    fieldErrors: {},
    formError: null,
  };
  const [state, formAction, isPending] = useActionState(submitJoinRequest, initialState);
  const hasFormError = state.formError !== null;

  return (
    <form action={formAction} noValidate className="mt-8">
      <FieldGroup>
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
                type={field.type ?? "text"}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete ?? "off"}
                placeholder={field.placeholder}
                defaultValue={state.values[field.name]}
                aria-invalid={hasError}
                aria-describedby={describedBy || undefined}
              />
              {hasHint && (
                <FieldDescription id={`${field.name}-hint`}>{field.hint}</FieldDescription>
              )}
              {hasError && <FieldError id={`${field.name}-error`}>{error}</FieldError>}
            </Field>
          );
        })}

        <BikeModelField
          modelName="bikeModel"
          engineName="engineSize"
          initialModel={state.values.bikeModel}
          initialEngine={state.values.engineSize}
          modelError={state.fieldErrors.bikeModel}
          engineError={state.fieldErrors.engineSize}
        />

        {hasFormError && <Alert variant="destructive">{state.formError}</Alert>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Enviando…" : "Enviar pedido"}
        </Button>
      </FieldGroup>
    </form>
  );
}
