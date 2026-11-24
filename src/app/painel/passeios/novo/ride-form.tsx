"use client";

import { useActionState, useState } from "react";

import { type RideFormState, type RideFormValues, saveRide } from "@/app/painel/passeios/actions";
import { StopsField } from "@/app/painel/passeios/novo/stops-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DIFFICULTIES,
  PLAN_B_MAX_LENGTH,
  RIDE_DESCRIPTION_MAX_LENGTH,
  type RideTipItem,
  SURFACES,
} from "@/server/ride-options";

type TextName = Exclude<
  keyof RideFormValues,
  "stops" | "description" | "surface" | "difficulty" | "tipIds" | "planB"
>;

type FieldConfig = {
  name: TextName | "photo";
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  accept?: string;
  inputMode?: "numeric" | "decimal";
  isNarrow?: boolean;
  // Shown and sent, not typed into: the value comes from somewhere else.
  isReadOnly?: boolean;
};

const headFields: FieldConfig[] = [
  { name: "route", label: "Percurso", placeholder: "Serra de Petrópolis pela estrada velha" },
];

const timeFields: FieldConfig[] = [
  { name: "date", label: "Data", type: "date", isNarrow: true },
  {
    name: "meetingTime",
    label: "Encontro",
    type: "time",
    hint: "Opcional. A partir de que horas chegar.",
    isNarrow: true,
  },
  { name: "departureTime", label: "Saída", type: "time", isNarrow: true },
  { name: "returnTime", label: "Previsão de retorno", type: "time", isNarrow: true },
];

const sheetFields: FieldConfig[] = [
  { name: "distanceKm", label: "Distância total", placeholder: "142", hint: "Em quilômetros.", inputMode: "numeric", isNarrow: true },
  { name: "rideTime", label: "Tempo de rolé", placeholder: "3h20", hint: "Opcional. Tempo de moto, sem as paradas.", isNarrow: true },
  { name: "tolls", label: "Pedágios", placeholder: "14,50", hint: "Opcional. Total em reais, por moto.", inputMode: "decimal", isNarrow: true },
];

type ChoiceProps = {
  name: "surface" | "difficulty";
  label: string;
  options: { value: string; label: string }[];
  initial: string;
  error?: string;
};

function Choice({ name, label, options, initial, error }: ChoiceProps) {
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
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <input type="hidden" name={name} value={value} />
      {hasError && <FieldError>{error}</FieldError>}
    </Field>
  );
}

const packingFields: FieldConfig[] = [
  {
    name: "packingNote",
    label: "Observação",
    placeholder: "Leve troco: o pedágio não aceita cartão.",
    hint: "Opcional. Para o que a lista não cobre.",
  },
];

function TipsChoice({ tips, initial, error }: { tips: RideTipItem[]; initial: string[]; error?: string }) {
  const [chosen, setChosen] = useState(initial);
  const hasError = Boolean(error);
  const hasTips = tips.length > 0;

  return (
    <Field data-invalid={hasError}>
      <FieldLabel id="tips-label">Recomendações</FieldLabel>
      {hasTips && (
        <ToggleGroup
          multiple
          variant="outline"
          value={chosen}
          onValueChange={setChosen}
          aria-labelledby="tips-label"
          aria-describedby="tips-hint"
        >
          {tips.map((tip) => (
            <ToggleGroupItem key={tip.id} value={tip.id}>
              {tip.text}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      {chosen.map((id) => (
        <input key={id} type="hidden" name="tipIds" value={id} />
      ))}
      <FieldDescription id="tips-hint">
        Opcional. Marque o que vale para este passeio. A lista é mantida em Passeios, Recomendações.
      </FieldDescription>
      {hasError && <FieldError>{error}</FieldError>}
    </Field>
  );
}

const tailFields: FieldConfig[] = [
  {
    name: "mapUrl",
    label: "Link do mapa",
    type: "url",
    placeholder: "https://maps.app.goo.gl/…",
    hint: "Opcional. Cole o link do Google Maps ou do Waze.",
  },
  {
    name: "photo",
    label: "Foto",
    type: "file",
    accept: "image/jpeg,image/png,image/webp",
    hint: "Opcional. JPG, PNG ou WebP de até 5 MB.",
  },
];

function TextFields({ fields, state }: { fields: FieldConfig[]; state: RideFormState }) {
  return fields.map((field) => {
    const error = state.fieldErrors[field.name];
    const hasError = Boolean(error);
    const hasHint = Boolean(field.hint);
    const isFile = field.type === "file";
    const describedBy = [hasHint ? `${field.name}-hint` : null, hasError ? `${field.name}-error` : null]
      .filter(Boolean)
      .join(" ");
    const defaultValue = isFile ? undefined : state.values[field.name as TextName];

    return (
      <Field key={field.name} data-invalid={hasError}>
        <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          type={field.type ?? "text"}
          accept={field.accept}
          inputMode={field.inputMode}
          placeholder={field.placeholder}
          defaultValue={defaultValue}
          autoComplete="off"
          readOnly={field.isReadOnly}
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
          className={field.isNarrow ? "sm:max-w-56" : undefined}
        />
        {hasHint && <FieldDescription id={`${field.name}-hint`}>{field.hint}</FieldDescription>}
        {hasError && <FieldError id={`${field.name}-error`}>{error}</FieldError>}
      </Field>
    );
  });
}

type RideFormProps = {
  initial: RideFormValues;
  tips: RideTipItem[];
  rideId?: string;
  // The ride already draws its road from a GPX file.
  hasTrack?: boolean;
};

export function RideForm({ initial, tips, rideId, hasTrack = false }: RideFormProps) {
  const initialState: RideFormState = { values: initial, fieldErrors: {}, attempt: 0 };
  const [state, formAction, isPending] = useActionState(saveRide, initialState);
  const hasFailed = state.attempt > 0;
  const isEditing = rideId !== undefined;
  const descriptionError = state.fieldErrors.description;
  const hasDescriptionError = Boolean(descriptionError);
  const planBError = state.fieldErrors.planB;
  const hasPlanBError = Boolean(planBError);
  const gpxError = state.fieldErrors.gpx;
  const hasGpxError = Boolean(gpxError);
  const gpxLabel = hasTrack ? "Trocar o arquivo GPX" : "Arquivo GPX da rota";
  // Kept in state so a refused save does not quietly untick it.
  const [removesTrack, setRemovesTrack] = useState(false);
  // While the ride keeps its file the distance is the file's and cannot be typed over.
  const isDistanceFromFile = hasTrack && !removesTrack;
  const rideSheetFields = isDistanceFromFile
    ? sheetFields.map((field) =>
        field.name === "distanceKm"
          ? { ...field, isReadOnly: true, hint: "Vem do arquivo GPX. Para digitar, troque ou remova o arquivo." }
          : field,
      )
    : sheetFields;
  const idleLabel = isEditing ? "Salvar passeio" : "Publicar passeio";
  const failure = isEditing
    ? "O passeio não foi salvo. Corrija o que está marcado e, se trocou a foto ou o GPX, escolha de novo."
    : "O passeio não foi publicado. Corrija o que está marcado e escolha de novo a foto e o GPX.";

  return (
    <form action={formAction} noValidate className="mt-8 max-w-2xl">
      {isEditing && <input type="hidden" name="rideId" value={rideId} />}

      <FieldGroup className="gap-8">
        {hasFailed && <Alert variant="destructive">{failure}</Alert>}

        <TextFields fields={headFields} state={state} />

        <Field data-invalid={hasDescriptionError}>
          <FieldLabel htmlFor="description">Descrição</FieldLabel>
          <Textarea
            id="description"
            name="description"
            maxLength={RIDE_DESCRIPTION_MAX_LENGTH}
            placeholder="Subida pela Estrada Velha da Estrela, almoço em Itaipava e volta pela BR-040."
            defaultValue={state.values.description}
            aria-invalid={hasDescriptionError}
            aria-describedby="description-hint"
          />
          <FieldDescription id="description-hint">
            Opcional. O que esperar do passeio, em até {RIDE_DESCRIPTION_MAX_LENGTH} caracteres.
          </FieldDescription>
          {hasDescriptionError && <FieldError>{descriptionError}</FieldError>}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextFields fields={timeFields} state={state} />
        </div>

        <StopsField key={state.attempt} initial={state.values.stops} error={state.fieldErrors.stops} />

        <fieldset className="grid gap-6">
          <legend className="label text-foreground">Traçado no mapa</legend>
          {hasTrack && (
            <p className="text-sm text-cream-dim">
              Este passeio usa o traçado de um arquivo GPX. Mexer nas paradas muda os marcadores, não
              o traçado.
            </p>
          )}
          {!hasTrack && (
            <p className="text-sm text-cream-dim">
              Sem arquivo, o mapa calcula a rota pelas paradas marcadas.
            </p>
          )}
          <Field data-invalid={hasGpxError}>
            <FieldLabel htmlFor="gpx">{gpxLabel}</FieldLabel>
            <Input
              id="gpx"
              name="gpx"
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              aria-invalid={hasGpxError}
              aria-describedby="gpx-hint"
            />
            <FieldDescription id="gpx-hint">
              Opcional. Trilha ou rota em GPX, até 5 MB. Enquanto o passeio tiver o arquivo, a distância
              é a dele, não a digitada. O arquivo não traz o tempo de rolé: ele fica vazio até você
              digitar.
            </FieldDescription>
            {hasGpxError && <FieldError>{gpxError}</FieldError>}
          </Field>
          {hasTrack && (
            <label className="flex min-h-12 cursor-pointer items-center gap-3">
              <Checkbox name="removeTrack" checked={removesTrack} onCheckedChange={setRemovesTrack} />
              <span>Remover o arquivo GPX e voltar à rota calculada pelas paradas</span>
            </label>
          )}
        </fieldset>

        <fieldset className="grid gap-6">
          <legend className="label text-foreground">Ficha da rota</legend>
          <p className="text-sm text-cream-dim">
            Distância, piso e dificuldade são obrigatórios: é o que o rider olha antes de decidir.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            <TextFields fields={rideSheetFields} state={state} />
          </div>
          <Choice
            key={`surface-${state.attempt}`}
            name="surface"
            label="Piso"
            options={SURFACES}
            initial={state.values.surface}
            error={state.fieldErrors.surface}
          />
          <Choice
            key={`difficulty-${state.attempt}`}
            name="difficulty"
            label="Dificuldade"
            options={DIFFICULTIES}
            initial={state.values.difficulty}
            error={state.fieldErrors.difficulty}
          />
        </fieldset>

        <fieldset className="grid gap-6">
          <legend className="label text-foreground">Leve com você</legend>
          <TipsChoice
            key={`tips-${state.attempt}`}
            tips={tips}
            initial={state.values.tipIds}
            error={state.fieldErrors.tips}
          />
          <TextFields fields={packingFields} state={state} />
        </fieldset>

        <Field data-invalid={hasPlanBError}>
          <FieldLabel htmlFor="planB">Plano B para chuva</FieldLabel>
          <Textarea
            id="planB"
            name="planB"
            maxLength={PLAN_B_MAX_LENGTH}
            placeholder="Com chuva forte na serra, o passeio vira café em Guapimirim, mesmo horário."
            defaultValue={state.values.planB}
            aria-invalid={hasPlanBError}
            aria-describedby="planB-hint"
          />
          <FieldDescription id="planB-hint">
            Opcional. O que acontece se o tempo virar, em até {PLAN_B_MAX_LENGTH} caracteres.
          </FieldDescription>
          {hasPlanBError && <FieldError>{planBError}</FieldError>}
        </Field>

        <TextFields fields={tailFields} state={state} />

        <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
          {isPending ? "Salvando…" : idleLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
