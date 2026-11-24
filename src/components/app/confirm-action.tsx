"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type ConfirmActionProps = {
  label: React.ReactNode;
  question: string;
  confirmLabel: string;
  keepLabel: string;
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  trigger?: "outline" | "ghost";
};

function ConfirmButtons({
  confirmLabel,
  keepLabel,
  onKeep,
}: Pick<ConfirmActionProps, "confirmLabel" | "keepLabel"> & { onKeep: () => void }) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-3 grid gap-2 sm:flex">
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Aguarde…" : confirmLabel}
      </Button>
      <Button type="button" variant="ghost" disabled={pending} onClick={onKeep}>
        {keepLabel}
      </Button>
    </div>
  );
}

// Two-step confirmation for actions that are hard to take back, shown in place.
export function ConfirmAction({
  label,
  question,
  confirmLabel,
  keepLabel,
  action,
  fields,
  trigger = "ghost",
}: ConfirmActionProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const triggerSize = trigger === "ghost" ? "inline" : "default";

  if (!isConfirming) {
    return (
      <Button
        type="button"
        variant={trigger}
        size={triggerSize}
        onClick={() => setIsConfirming(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <form action={action} className="w-full border-t border-border pt-4">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <p>{question}</p>
      <ConfirmButtons
        confirmLabel={confirmLabel}
        keepLabel={keepLabel}
        onKeep={() => setIsConfirming(false)}
      />
    </form>
  );
}
