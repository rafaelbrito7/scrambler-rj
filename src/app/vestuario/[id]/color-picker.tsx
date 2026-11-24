"use client";

import Image from "next/image";

import { FieldLegend, FieldSet } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ColorOption = {
  id: string;
  name: string;
  photoUrl: string;
};

type ColorPickerProps = {
  model: string;
  colors: ColorOption[];
  selectedId: string;
  onSelect: (colorId: string) => void;
  counts?: Record<string, number>;
};

export function ColorPicker({ model, colors, selectedId, onSelect, counts = {} }: ColorPickerProps) {
  return (
    <div>
      {/* Every photo stays mounted so going back to a colour shows it at once. */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-card">
        {colors.map((color, index) => {
          const isSelected = color.id === selectedId;

          return (
            <Image
              key={color.id}
              src={color.photoUrl}
              alt={isSelected ? `${model} na cor ${color.name}` : ""}
              aria-hidden={!isSelected}
              fill
              unoptimized
              priority={index === 0}
              sizes="(min-width: 640px) 24rem, 100vw"
              className={`object-cover transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0"}`}
            />
          );
        })}
      </div>

      <FieldSet className="mt-5">
        <FieldLegend className="text-muted-foreground">Cor</FieldLegend>
        <ToggleGroup
          variant="outline"
          value={[selectedId]}
          onValueChange={([nextId]) => {
            if (nextId) onSelect(nextId);
          }}
          aria-label="Cor"
        >
          {colors.map((color) => {
            const count = counts[color.id] ?? 0;
            const hasCount = count > 0;

            return (
              <ToggleGroupItem key={color.id} value={color.id}>
                {color.name}
                {hasCount && (
                  <span className="tabular-nums">
                    <span aria-hidden="true">· {count}</span>
                    <span className="sr-only">, {count} no pedido</span>
                  </span>
                )}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </FieldSet>
    </div>
  );
}
