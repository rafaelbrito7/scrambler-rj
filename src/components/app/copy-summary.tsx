"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type CopyState = "idle" | "copied" | "failed";

type CopySummaryProps = {
  text: string;
  variant?: "outline" | "ghost";
};

// Copies the campaign summary for pasting in WhatsApp. When the browser refuses clipboard
// access, the text is shown so it can still be selected by hand.
export function CopySummary({ text, variant = "outline" }: CopySummaryProps) {
  const [state, setState] = useState<CopyState>("idle");
  const hasCopied = state === "copied";
  const hasFailed = state === "failed";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className={hasFailed ? "w-full" : undefined}>
      <Button type="button" variant={variant} onClick={copy} className="w-full sm:w-auto">
        {hasCopied ? "Resumo copiado" : "Copiar resumo"}
      </Button>
      <p aria-live="polite" className="sr-only">
        {hasCopied ? "Resumo copiado. Cole no WhatsApp." : ""}
      </p>
      {hasFailed && (
        <div className="mt-3">
          <label htmlFor="summary-text" className="text-sm text-destructive">
            Não deu pra copiar sozinho. Selecione o texto e copie:
          </label>
          <textarea
            id="summary-text"
            readOnly
            rows={6}
            value={text}
            onFocus={(event) => event.target.select()}
            className="mt-2 block w-full rounded-sm border border-input bg-transparent p-3 text-sm"
          />
        </div>
      )}
    </div>
  );
}
