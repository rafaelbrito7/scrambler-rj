"use client";

import { useActionState, useState } from "react";

import type { OrderFormState } from "@/app/vestuario/[id]/actions";
import { type ColorOption, ColorPicker } from "@/app/vestuario/[id]/color-picker";
import { formatPrice } from "@/components/app/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAX_ITEM_QUANTITY, type OrderItemInput } from "@/server/orders";

type OrderAction = (state: OrderFormState, formData: FormData) => Promise<OrderFormState>;

type OrderBuilderProps = {
  title: string;
  submitLabel: string;
  saveAction: OrderAction;
  deleteAction?: OrderAction;
  // Hidden fields that tell the action which order or batch it is saving.
  fields: Record<string, string>;
  warnsAboutPaymentReset?: boolean;
  // The size saved in the profile, when this batch offers it. A hint only.
  suggestedSize?: string | null;
  model: string;
  unitPriceCents: number;
  sizes: string[];
  colors: ColorOption[];
  initialItems: OrderItemInput[];
};

type Quantities = Record<string, number>;

const idleState: OrderFormState = { error: null };

async function keepState(state: OrderFormState) {
  return state;
}

function keyFor(colorId: string, size: string) {
  return `${colorId}:${size}`;
}

function toQuantities(items: OrderItemInput[]): Quantities {
  return Object.fromEntries(items.map((item) => [keyFor(item.colorId, item.size), item.quantity]));
}

export function OrderBuilder({
  title,
  submitLabel,
  saveAction: saveOrder,
  deleteAction,
  fields,
  warnsAboutPaymentReset = false,
  suggestedSize = null,
  model,
  unitPriceCents,
  sizes,
  colors,
  initialItems,
}: OrderBuilderProps) {
  const [selectedColorId, setSelectedColorId] = useState(
    initialItems[0]?.colorId ?? colors[0].id,
  );
  const [quantities, setQuantities] = useState<Quantities>(() => toQuantities(initialItems));
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [saveState, saveFormAction, isSaving] = useActionState(saveOrder, idleState);
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteAction ?? keepState,
    idleState,
  );

  const selectedColor = colors.find((color) => color.id === selectedColorId) ?? colors[0];
  const items: (OrderItemInput & { colorName: string })[] = colors.flatMap((color) =>
    sizes
      .map((size) => ({
        colorId: color.id,
        colorName: color.name,
        size,
        quantity: quantities[keyFor(color.id, size)] ?? 0,
      }))
      .filter((item) => item.quantity > 0),
  );
  const pieces = items.reduce((sum, item) => sum + item.quantity, 0);
  const piecesByColor = Object.fromEntries(
    colors.map((color) => [
      color.id,
      items
        .filter((item) => item.colorId === color.id)
        .reduce((sum, item) => sum + item.quantity, 0),
    ]),
  );
  const error = saveState.error ?? deleteState.error;
  const hasError = error !== null;
  const canDelete = deleteAction !== undefined && initialItems.length > 0;
  const initialPieces = initialItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasPieces = pieces > 0;
  const savedQuantities = toQuantities(initialItems);
  const hasChanges =
    items.length !== initialItems.length ||
    items.some((item) => savedQuantities[keyFor(item.colorId, item.size)] !== item.quantity);
  const isBusy = isSaving || isDeleting;
  const canSubmit = hasPieces && hasChanges && !isBusy;
  const showsDeleteButton = canDelete && !isConfirmingDelete;
  const showsDeleteConfirmation = canDelete && isConfirmingDelete;
  const showsResetWarning = warnsAboutPaymentReset && hasPieces && pieces !== initialPieces;
  const piecesLabel = pieces === 1 ? "1 peça" : `${pieces} peças`;

  function changeQuantity(size: string, delta: number) {
    const key = keyFor(selectedColor.id, size);

    setQuantities((current) => {
      const next = Math.min(MAX_ITEM_QUANTITY, Math.max(0, (current[key] ?? 0) + delta));

      return { ...current, [key]: next };
    });
  }

  return (
    <>
      <div className="sm:col-start-2 sm:row-span-2 sm:row-start-1">
        <ColorPicker
          model={model}
          colors={colors}
          selectedId={selectedColor.id}
          onSelect={setSelectedColorId}
          counts={piecesByColor}
        />
      </div>

      <section aria-labelledby="order-title" className="sm:self-start">
        <h2 id="order-title" className="label text-foreground">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Quantas peças na cor {selectedColor.name}? Troque a cor para somar outras.
        </p>

        <ul className="mt-3 divide-y divide-border border-y border-border">
          {sizes.map((size) => {
            const quantity = quantities[keyFor(selectedColor.id, size)] ?? 0;
            const isAtMinimum = quantity === 0;
            const isAtMaximum = quantity === MAX_ITEM_QUANTITY;
            const isSuggested = size === suggestedSize;

            return (
              <li key={size} className="flex items-center justify-between gap-4 py-2">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="label">{size}</span>
                  {isSuggested && <Badge variant="outline">Seu tamanho</Badge>}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isAtMinimum}
                    onClick={() => changeQuantity(size, -1)}
                    aria-label={`Tirar uma ${selectedColor.name} ${size}`}
                  >
                    −
                  </Button>
                  <output
                    aria-label={`${selectedColor.name} ${size}`}
                    className="w-10 text-center text-lg font-semibold tabular-nums"
                  >
                    {quantity}
                  </output>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isAtMaximum}
                    onClick={() => changeQuantity(size, 1)}
                    aria-label={`Somar uma ${selectedColor.name} ${size}`}
                  >
                    +
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <div aria-live="polite" className="mt-5">
          {hasPieces && (
            <ul className="grid gap-1">
              {items.map((item) => (
                <li key={keyFor(item.colorId, item.size)} className="flex justify-between gap-4">
                  <span>
                    {item.colorName} · {item.size}
                  </span>
                  <span className="tabular-nums">× {item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <span className="label text-muted-foreground">{hasPieces ? piecesLabel : "Total"}</span>
            <span className="text-2xl font-semibold tabular-nums">
              {formatPrice(pieces * unitPriceCents)}
            </span>
          </p>
        </div>

        {hasError && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}

        {showsResetWarning && (
          <Alert variant="destructive" role="status" className="mt-4">
            Mudar a quantidade muda o total: o pedido volta a Pendente e o pagamento precisa ser
            conferido de novo.
          </Alert>
        )}

        <form action={saveFormAction} className="mt-5">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isSaving ? "Salvando…" : submitLabel}
          </Button>
        </form>

        {showsDeleteButton && (
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={() => setIsConfirmingDelete(true)}
            className="mt-2 w-full"
          >
            Excluir pedido
          </Button>
        )}
        {showsDeleteConfirmation && (
          <form action={deleteFormAction} className="mt-4 rounded-sm bg-card p-4">
            {Object.entries(fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <p>Excluir seu pedido desta campanha? Você pode fazer outro enquanto a campanha estiver aberta.</p>
            <div className="mt-3 grid gap-2 sm:flex">
              <Button type="submit" variant="destructive" disabled={isBusy}>
                {isDeleting ? "Excluindo…" : "Sim, excluir"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={isBusy}
                onClick={() => setIsConfirmingDelete(false)}
              >
                Manter pedido
              </Button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
