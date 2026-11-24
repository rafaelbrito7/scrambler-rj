"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

import type { GarmentFormState } from "@/app/painel/vestuario/garment-form-data";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MAX_BATCH_COLORS } from "@/server/batches";
import { GARMENT_SIZES } from "@/server/sizes";

export type GarmentInitial = {
  model: string;
  unitPrice: string;
  sizes: string[];
  colors: { name: string; photoKey: string | null }[];
};

type GarmentFormProps = {
  action: (state: GarmentFormState, formData: FormData) => Promise<GarmentFormState>;
  initial?: GarmentInitial;
  // Extra hidden fields, such as the recipe a batch is being opened from.
  fields?: Record<string, string>;
  submitLabel: string;
  pendingLabel: string;
  failureMessage: string;
};

type ColorRow = {
  id: number;
  name: string;
  photoKey: string | null;
};

type ColorFieldsProps = {
  row: ColorRow;
  position: number;
  canRemove: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
};

const emptyGarment: GarmentInitial = {
  model: "",
  unitPrice: "",
  sizes: [],
  colors: [{ name: "", photoKey: null }],
};

function ColorFields({ row, position, canRemove, onRename, onRemove }: ColorFieldsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const hasSavedPhoto = row.photoKey !== null;
  const hasPreview = previewUrl !== null;
  const showsSavedPhoto = hasSavedPhoto && !hasPreview;
  const nameId = `color-name-${row.id}`;
  const photoId = `color-photo-${row.id}`;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <li className="rounded-sm bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="label text-muted-foreground">Cor {position}</p>
        {canRemove && (
          <Button type="button" variant="ghost" size="inline" onClick={onRemove}>
            Remover<span className="sr-only"> cor {position}</span>
          </Button>
        )}
      </div>

      <input type="hidden" name="colorPhotoKey" value={row.photoKey ?? ""} />

      <div className="mt-2 grid gap-4 sm:grid-cols-2 sm:items-end">
        <Field>
          <FieldLabel htmlFor={nameId}>Nome da cor</FieldLabel>
          <Input
            id={nameId}
            name="colorName"
            value={row.name}
            onChange={(event) => onRename(event.target.value)}
            placeholder="Preta"
            autoComplete="off"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={photoId}>{hasSavedPhoto ? "Trocar foto" : "Foto"}</FieldLabel>
          <Input
            id={photoId}
            name="colorPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
          />
        </Field>

        {hasPreview && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, nothing to optimize
          <img
            src={previewUrl}
            alt={`Foto escolhida para a cor ${position}`}
            className="size-20 rounded-sm object-cover"
          />
        )}
        {showsSavedPhoto && (
          <Image
            src={`/fotos/${row.photoKey}`}
            alt={`Foto atual da cor ${position}`}
            width={80}
            height={80}
            unoptimized
            className="size-20 rounded-sm object-cover"
          />
        )}
      </div>
    </li>
  );
}

// The garment form behind "open batch" and the recipe screens: one piece, one price, sizes
// and colour/photo pairs.
export function GarmentForm({
  action,
  initial = emptyGarment,
  fields = {},
  submitLabel,
  pendingLabel,
  failureMessage,
}: GarmentFormProps) {
  const initialState: GarmentFormState = {
    values: { model: initial.model, unitPrice: initial.unitPrice, sizes: initial.sizes },
    fieldErrors: {},
    attempt: 0,
  };
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [rows, setRows] = useState<ColorRow[]>(() =>
    initial.colors.map((color, id) => ({ id, ...color })),
  );
  const [nextId, setNextId] = useState(initial.colors.length);
  const [sizes, setSizes] = useState<string[]>(initial.sizes);
  const errors = state.fieldErrors;
  const canAddColor = rows.length < MAX_BATCH_COLORS;
  const canRemoveColor = rows.length > 1;
  const hasFailed = state.attempt > 0;
  const hasModelError = Boolean(errors.model);
  const hasPriceError = Boolean(errors.unitPrice);
  const hasSizesError = Boolean(errors.sizes);
  const hasColorsError = Boolean(errors.colors);

  function addColor() {
    setRows((current) => [...current, { id: nextId, name: "", photoKey: null }]);
    setNextId((current) => current + 1);
  }

  function renameColor(id: number, name: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, name } : row)));
  }

  function removeColor(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  return (
    <form action={formAction} noValidate className="mt-8 max-w-2xl">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <FieldGroup className="gap-8">
        {hasFailed && <Alert variant="destructive">{failureMessage}</Alert>}

        <Field data-invalid={hasModelError}>
          <FieldLabel htmlFor="model">Modelo da peça</FieldLabel>
          <Input
            id="model"
            name="model"
            defaultValue={state.values.model}
            placeholder="Camiseta Mirante"
            autoComplete="off"
            aria-invalid={hasModelError}
            aria-describedby={hasModelError ? "model-error" : undefined}
          />
          {hasModelError && <FieldError id="model-error">{errors.model}</FieldError>}
        </Field>

        <Field data-invalid={hasPriceError}>
          <FieldLabel htmlFor="unitPrice">Preço por peça (R$)</FieldLabel>
          <Input
            id="unitPrice"
            name="unitPrice"
            defaultValue={state.values.unitPrice}
            placeholder="80,00"
            inputMode="decimal"
            autoComplete="off"
            aria-invalid={hasPriceError}
            aria-describedby={hasPriceError ? "unitPrice-hint unitPrice-error" : "unitPrice-hint"}
            className="sm:max-w-48"
          />
          <FieldDescription id="unitPrice-hint">
            O mesmo preço vale para todas as cores e tamanhos.
          </FieldDescription>
          {hasPriceError && <FieldError id="unitPrice-error">{errors.unitPrice}</FieldError>}
        </Field>

        <FieldSet aria-describedby={hasSizesError ? "sizes-error" : undefined}>
          <FieldLegend>Tamanhos</FieldLegend>
          <ToggleGroup
            multiple
            variant="outline"
            value={sizes}
            onValueChange={setSizes}
            aria-label="Tamanhos"
          >
            {GARMENT_SIZES.map((size) => (
              <ToggleGroupItem key={size} value={size}>
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {GARMENT_SIZES
            .filter((size) => sizes.includes(size))
            .map((size) => (
              <input key={size} type="hidden" name="sizes" value={size} />
            ))}
          {hasSizesError && <FieldError id="sizes-error">{errors.sizes}</FieldError>}
        </FieldSet>

        <FieldSet aria-describedby={hasColorsError ? "colors-hint colors-error" : "colors-hint"}>
          <FieldLegend>Cores e fotos</FieldLegend>
          <FieldDescription id="colors-hint">
            Cada cor precisa da própria foto. JPG, PNG ou WebP de até 5 MB.
          </FieldDescription>

          <ul className="mt-1 grid gap-3">
            {rows.map((row, index) => (
              <ColorFields
                key={`${row.id}-${state.attempt}`}
                row={row}
                position={index + 1}
                canRemove={canRemoveColor}
                onRename={(name) => renameColor(row.id, name)}
                onRemove={() => removeColor(row.id)}
              />
            ))}
          </ul>

          {hasColorsError && <FieldError id="colors-error">{errors.colors}</FieldError>}

          {canAddColor && (
            <Button type="button" variant="outline" onClick={addColor} className="w-full sm:w-fit">
              Adicionar cor
            </Button>
          )}
        </FieldSet>

        <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
