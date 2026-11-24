"use client";

import { useState } from "react";

import { type ColorOption, ColorPicker } from "@/app/vestuario/[id]/color-picker";

type OrderSummaryProps = {
  model: string;
  colors: ColorOption[];
  children: React.ReactNode;
};

// Read-only counterpart of the order builder: the photos still switch, nothing can be changed.
export function OrderSummary({ model, colors, children }: OrderSummaryProps) {
  const [selectedColorId, setSelectedColorId] = useState(colors[0].id);

  return (
    <>
      <div className="sm:col-start-2 sm:row-span-2 sm:row-start-1">
        <ColorPicker
          model={model}
          colors={colors}
          selectedId={selectedColorId}
          onSelect={setSelectedColorId}
        />
      </div>

      <div className="sm:self-start">{children}</div>
    </>
  );
}
