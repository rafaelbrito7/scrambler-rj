"use client";

import { useActionState, useState } from "react";

import type { OrderFormState } from "@/app/vestuario/[id]/actions";
import { undoOrderPayment } from "@/app/painel/vestuario/[id]/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type UndoPaymentProps = {
  batchId: string;
  orderId: string;
  participantName: string;
};

const idleState: OrderFormState = { error: null };

export function UndoPayment({ batchId, orderId, participantName }: UndoPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(undoOrderPayment, idleState);
  const hasError = state.error !== null;
  const reasonId = `reason-${orderId}`;

  if (!isOpen) {
    return (
      <Button type="button" variant="ghost" size="inline" onClick={() => setIsOpen(true)}>
        Desfazer pagamento<span className="sr-only"> de {participantName}</span>
      </Button>
    );
  }

  return (
    <form action={formAction} className="w-full border-t border-border pt-4">
      <input type="hidden" name="batchId" value={batchId} />
      <input type="hidden" name="orderId" value={orderId} />

      <Field data-invalid={hasError}>
        <FieldLabel htmlFor={reasonId}>Motivo para desfazer</FieldLabel>
        <Input
          id={reasonId}
          name="reason"
          autoFocus
          autoComplete="off"
          maxLength={200}
          placeholder="Marquei a pessoa errada"
          aria-invalid={hasError}
          aria-describedby={`${reasonId}-hint${hasError ? ` ${reasonId}-error` : ""}`}
        />
        <FieldDescription id={`${reasonId}-hint`}>
          O pedido volta a Pendente. O motivo fica no histórico com seu nome.
        </FieldDescription>
        {hasError && <FieldError id={`${reasonId}-error`}>{state.error}</FieldError>}
      </Field>

      <div className="mt-3 grid gap-2 sm:flex">
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "Desfazendo…" : "Desfazer pagamento"}
        </Button>
        <Button type="button" variant="ghost" disabled={isPending} onClick={() => setIsOpen(false)}>
          Manter como pago
        </Button>
      </div>
    </form>
  );
}
