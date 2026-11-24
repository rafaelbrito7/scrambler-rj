"use client";

import { useActionState, useState } from "react";

import { type ProfileFormState, savePersonalData } from "@/app/perfil/actions";
import { PhotoField } from "@/app/perfil/editar/photo-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PersonalDataField, PersonalDataInput } from "@/server/profiles";
import { HEALTH_NOTES_MAX_LENGTH } from "@/server/health-limits";
import { BIO_MAX_LENGTH, EXPERIENCE_LEVELS, REGIONS } from "@/server/profile-options";
import { BLOOD_TYPES, GARMENT_SIZES } from "@/server/sizes";

type TextFieldConfig = {
  name: Exclude<
    PersonalDataField,
    "shirtSize" | "bloodType" | "region" | "experience" | "healthNotes"
  >;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric";
  isNarrow?: boolean;
  autoComplete?: string;
  maxLength?: number;
};

const groupFields: TextFieldConfig[] = [
  { name: "fullName", label: "Nome", autoComplete: "name" },
  {
    name: "nickname",
    label: "Apelido",
    hint: "Opcional. Se preencher, é assim que você aparece nas listas do grupo.",
    placeholder: "Como os riders te chamam",
  },
  {
    name: "instagram",
    label: "Instagram",
    hint: "Opcional. Digite o usuário ou cole o link do perfil.",
    placeholder: "@usuario",
  },
  {
    name: "bio",
    label: "Sobre você",
    hint: `Opcional. Uma linha, até ${BIO_MAX_LENGTH} caracteres.`,
    placeholder: "Scrambler 900, serra aos sábados",
    maxLength: BIO_MAX_LENGTH,
  },
  {
    name: "birthday",
    label: "Aniversário",
    hint: "Opcional. Só dia e mês, sem o ano. Você aparece entre os aniversariantes do mês na tela Riders.",
    placeholder: "12/08",
    inputMode: "numeric",
    maxLength: 5,
    isNarrow: true,
  },
];

type ChoiceFieldProps = {
  name: "region" | "experience";
  label: string;
  hint: string;
  options: { value: string; label: string }[];
  initial: string;
  error?: string;
};

function ChoiceField({ name, label, hint, options, initial, error }: ChoiceFieldProps) {
  const [value, setValue] = useState(initial);
  const hasError = Boolean(error);
  const selected = value ? [value] : [];

  return (
    <Field data-invalid={hasError}>
      <FieldLabel id={`${name}-label`}>{label}</FieldLabel>
      <ToggleGroup
        variant="outline"
        value={selected}
        onValueChange={([next]) => setValue(next ?? "")}
        aria-labelledby={`${name}-label`}
        aria-describedby={`${name}-hint`}
        className="flex-wrap"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <input type="hidden" name={name} value={value} />
      <FieldDescription id={`${name}-hint`}>{hint}</FieldDescription>
      {hasError && <FieldError>{error}</FieldError>}
    </Field>
  );
}

const privateFields: TextFieldConfig[] = [
  {
    name: "whatsapp",
    label: "WhatsApp",
    hint: "Com DDD.",
    placeholder: "(21) 98888-7777",
    type: "tel",
    inputMode: "tel",
    autoComplete: "tel-national",
  },
];

const secondContactFields: TextFieldConfig[] = [
  {
    name: "emergencyName2",
    label: "Nome do segundo contato",
    hint: "Opcional. Para quando o primeiro não atender.",
    placeholder: "Paulo (irmão)",
  },
  {
    name: "emergencyPhone2",
    label: "Telefone do segundo contato",
    hint: "Com DDD.",
    placeholder: "(21) 96666-4321",
    type: "tel",
    inputMode: "tel",
  },
];

const healthPlanFields: TextFieldConfig[] = [
  { name: "healthPlan", label: "Plano de saúde", hint: "Opcional. O nome do plano.", placeholder: "Unimed Rio" },
  {
    name: "healthPlanCard",
    label: "Número da carteirinha",
    hint: "Opcional. Como está no cartão do plano.",
    inputMode: "numeric",
  },
];

const emergencyFields: TextFieldConfig[] = [
  {
    name: "emergencyName",
    label: "Nome do contato",
    hint: "Quem avisar. Pode dizer o parentesco.",
    placeholder: "Carla (mãe)",
  },
  {
    name: "emergencyPhone",
    label: "Telefone do contato",
    hint: "Com DDD.",
    placeholder: "(21) 97777-1234",
    type: "tel",
    inputMode: "tel",
  },
];

type TextFieldsProps = {
  fields: TextFieldConfig[];
  state: ProfileFormState;
};

function TextFields({ fields, state }: TextFieldsProps) {
  return fields.map((field) => {
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
          autoCapitalize={field.name === "instagram" ? "none" : undefined}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className={field.isNarrow ? "max-w-32" : undefined}
          defaultValue={state.values[field.name]}
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
        />
        {hasHint && <FieldDescription id={`${field.name}-hint`}>{field.hint}</FieldDescription>}
        {hasError && <FieldError id={`${field.name}-error`}>{error}</FieldError>}
      </Field>
    );
  });
}

type ProfileFormProps = {
  initial: PersonalDataInput;
  currentPhoto: React.ReactNode;
  hasPhoto: boolean;
};

export function ProfileForm({ initial, currentPhoto, hasPhoto }: ProfileFormProps) {
  const initialState: ProfileFormState = { values: initial, fieldErrors: {}, attempt: 0 };
  const [state, formAction, isPending] = useActionState(savePersonalData, initialState);
  const [shirtSize, setShirtSize] = useState(initial.shirtSize);
  const [bloodType, setBloodType] = useState(initial.bloodType);
  const hasFailed = state.attempt > 0;
  const sizeError = state.fieldErrors.shirtSize;
  const hasSizeError = Boolean(sizeError);
  const selectedSizes = shirtSize ? [shirtSize] : [];
  const selectedBloodTypes = bloodType ? [bloodType] : [];
  const bloodError = state.fieldErrors.bloodType;
  const hasBloodError = Boolean(bloodError);
  const notesError = state.fieldErrors.healthNotes;
  const hasNotesError = Boolean(notesError);

  return (
    <form action={formAction} noValidate className="mt-8 max-w-2xl">
      <FieldGroup className="gap-10">
        {hasFailed && (
          <Alert variant="destructive">
            O perfil não foi salvo. Corrija os campos marcados e, se trocou a foto, escolha de novo.
          </Alert>
        )}

        <FieldSet className="gap-6">
          <FieldLegend>Todo o grupo vê</FieldLegend>
          <PhotoField
            key={state.attempt}
            current={currentPhoto}
            hasPhoto={hasPhoto}
            error={state.fieldErrors.photo}
          />
          <TextFields fields={groupFields} state={state} />
          <ChoiceField
            key={`region-${state.attempt}`}
            name="region"
            label="Região"
            hint="Opcional. De onde você costuma sair; ajuda a combinar ponto de encontro. Toque de novo para tirar."
            options={REGIONS}
            initial={state.values.region}
            error={state.fieldErrors.region}
          />
          <ChoiceField
            key={`experience-${state.attempt}`}
            name="experience"
            label="Experiência de pilotagem"
            hint="Opcional. Ajuda o grupo a calibrar o ritmo dos passeios."
            options={EXPERIENCE_LEVELS}
            initial={state.values.experience}
            error={state.fieldErrors.experience}
          />
        </FieldSet>

        <div className="rounded-sm bg-card p-5">
          <FieldSet className="gap-6">
            <FieldLegend>Só você e os administradores veem</FieldLegend>
            <TextFields fields={privateFields} state={state} />

            <Field data-invalid={hasSizeError}>
              <FieldLabel id="shirtSize-label">Tamanho de roupa</FieldLabel>
              <ToggleGroup
                variant="outline"
                value={selectedSizes}
                onValueChange={([next]) => setShirtSize(next ?? "")}
                aria-labelledby="shirtSize-label"
                aria-describedby="shirtSize-hint"
              >
                {GARMENT_SIZES.map((size) => (
                  <ToggleGroupItem key={size} value={size}>
                    {size}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <input type="hidden" name="shirtSize" value={shirtSize} />
              <FieldDescription id="shirtSize-hint">
                Opcional. Aparece marcado quando você for pedir uma peça. Toque de novo para tirar.
              </FieldDescription>
              {hasSizeError && <FieldError>{sizeError}</FieldError>}
            </Field>
          </FieldSet>
        </div>

        <div className="rounded-sm bg-card p-5">
          <FieldSet className="gap-6">
            <FieldLegend>Em caso de emergência</FieldLegend>
            <FieldDescription>
              Opcional. Só você e os administradores veem, para saber a quem avisar num passeio.
              Você pode apagar quando quiser.
            </FieldDescription>
            <TextFields fields={emergencyFields} state={state} />

            <Field data-invalid={hasBloodError}>
              <FieldLabel id="bloodType-label">Tipo sanguíneo</FieldLabel>
              <ToggleGroup
                variant="outline"
                value={selectedBloodTypes}
                onValueChange={([next]) => setBloodType(next ?? "")}
                aria-labelledby="bloodType-label"
              >
                {BLOOD_TYPES.map((type) => (
                  <ToggleGroupItem key={type} value={type}>
                    {type}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <input type="hidden" name="bloodType" value={bloodType} />
              {hasBloodError && <FieldError>{bloodError}</FieldError>}
            </Field>

            <TextFields fields={secondContactFields} state={state} />
            <TextFields fields={healthPlanFields} state={state} />

            <Field data-invalid={hasNotesError}>
              <FieldLabel htmlFor="healthNotes">Alergias e condições de saúde</FieldLabel>
              <Textarea
                id="healthNotes"
                name="healthNotes"
                maxLength={HEALTH_NOTES_MAX_LENGTH}
                placeholder="Alergia a dipirona. Diabetes tipo 1."
                defaultValue={state.values.healthNotes}
                aria-invalid={hasNotesError}
                aria-describedby="healthNotes-hint"
              />
              <FieldDescription id="healthNotes-hint">
                Opcional. O que quem for te socorrer precisa saber. Até {HEALTH_NOTES_MAX_LENGTH}{" "}
                caracteres.
              </FieldDescription>
              {hasNotesError && <FieldError>{notesError}</FieldError>}
            </Field>
          </FieldSet>
        </div>

        <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
          {isPending ? "Salvando…" : "Salvar perfil"}
        </Button>
      </FieldGroup>
    </form>
  );
}
