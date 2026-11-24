"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { PinPicker } from "@/components/app/pin-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  type MapPoint,
  MAX_STOPS,
  STOP_KINDS,
  STOP_NOTE_MAX_LENGTH,
  type StopInput,
} from "@/server/ride-options";

type Row = StopInput & { key: number };

const emptyStop: StopInput = { kind: "FUEL", name: "", place: "", time: "", note: "", lat: "", lon: "" };

type StopsFieldProps = { initial: StopInput[]; error?: string };

// The itinerary is edited in place and travels with the form as one JSON field, so a refused
// save brings every stop back as typed.
export function StopsField({ initial, error }: StopsFieldProps) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((stop, key) => ({ ...stop, key })));
  const [nextKey, setNextKey] = useState(initial.length);
  const hasError = Boolean(error);
  const canAdd = rows.length < MAX_STOPS;
  const serialized = JSON.stringify(
    rows.map(({ kind, name, place, time, note, lat, lon }) => ({ kind, name, place, time, note, lat, lon })),
  );
  const [openMap, setOpenMap] = useState<number | null>(null);

  function change(key: number, field: keyof StopInput, value: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function pin(key: number, point: MapPoint | null) {
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, lat: point ? String(point.lat) : "", lon: point ? String(point.lon) : "" } : row,
      ),
    );
  }

  function move(index: number, step: number) {
    setRows((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);

      next.splice(index + step, 0, moved);

      return next;
    });
  }

  function add() {
    setRows((current) => [...current, { ...emptyStop, key: nextKey }]);
    setNextKey((key) => key + 1);
  }

  return (
    <fieldset className="grid gap-4" aria-describedby="stops-hint">
      <legend className="label text-foreground">Roteiro</legend>
      <p id="stops-hint" className="text-sm text-cream-dim">
        As paradas na ordem do passeio. A primeira é sempre o encontro; só tipo e nome são
        obrigatórios.
      </p>
      {hasError && <FieldError>{error}</FieldError>}
      <input type="hidden" name="stops" value={serialized} />

      <ol className="grid gap-3">
        {rows.map((row, index) => {
          const isFirst = index === 0;
          const isLast = index === rows.length - 1;
          const canMoveUp = index > 1;
          const canMoveDown = !isFirst && !isLast;
          const id = `stop-${row.key}`;
          const hasPin = Boolean(row.lat) && Boolean(row.lon);
          const point = hasPin ? { lat: Number(row.lat), lon: Number(row.lon) } : null;
          const isMapOpen = openMap === row.key;

          return (
            <li key={row.key} className="rounded-sm bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="label text-muted-foreground">Parada {index + 1}</p>
                {!isFirst && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!canMoveUp}
                      onClick={() => move(index, -1)}
                      aria-label={`Subir a parada ${index + 1}`}
                    >
                      <ArrowUpIcon aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!canMoveDown}
                      onClick={() => move(index, 1)}
                      aria-label={`Descer a parada ${index + 1}`}
                    >
                      <ArrowDownIcon aria-hidden />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${id}-kind`}>Tipo</FieldLabel>
                  {isFirst && (
                    <p id={`${id}-kind`} className="flex min-h-12 items-center font-semibold">
                      Encontro
                    </p>
                  )}
                  {!isFirst && (
                    <NativeSelect
                      id={`${id}-kind`}
                      value={row.kind}
                      onChange={(event) => change(row.key, "kind", event.target.value)}
                    >
                      {STOP_KINDS.filter((kind) => kind.value !== "MEETING").map((kind) => (
                        <NativeSelectOption key={kind.value} value={kind.value}>
                          {kind.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-time`}>Horário</FieldLabel>
                  <Input
                    id={`${id}-time`}
                    type="time"
                    value={row.time}
                    onChange={(event) => change(row.key, "time", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-name`}>Nome</FieldLabel>
                  <Input
                    id={`${id}-name`}
                    value={row.name}
                    autoComplete="off"
                    placeholder={isFirst ? "Posto Shell da Washington Luís" : "Mirante do Cristo"}
                    onChange={(event) => change(row.key, "name", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${id}-place`}>Local</FieldLabel>
                  <Input
                    id={`${id}-place`}
                    value={row.place}
                    autoComplete="off"
                    placeholder="Bairro, cidade ou estrada"
                    onChange={(event) => change(row.key, "place", event.target.value)}
                  />
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={`${id}-note`}>Observação</FieldLabel>
                  <Input
                    id={`${id}-note`}
                    value={row.note}
                    autoComplete="off"
                    maxLength={STOP_NOTE_MAX_LENGTH}
                    placeholder="Último posto antes da subida"
                    onChange={(event) => change(row.key, "note", event.target.value)}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="inline"
                    aria-expanded={isMapOpen}
                    onClick={() => setOpenMap(isMapOpen ? null : row.key)}
                  >
                    {isMapOpen ? "Fechar o mapa" : hasPin ? "Mudar o ponto no mapa" : "Marcar no mapa"}
                    <span className="sr-only">, parada {index + 1}</span>
                  </Button>
                  {hasPin && <Badge>No mapa</Badge>}
                  {hasPin && (
                    <Button type="button" variant="ghost" size="inline" onClick={() => pin(row.key, null)}>
                      Tirar do mapa<span className="sr-only">, parada {index + 1}</span>
                    </Button>
                  )}
                </div>
                {isMapOpen && (
                  <div className="mt-3">
                    <PinPicker
                      value={point}
                      onChange={(next) => pin(row.key, next)}
                      label={`Mapa para marcar a parada ${index + 1}. Toque no ponto exato.`}
                    />
                    <p className="mt-2 text-sm text-cream-dim">
                      Aproxime e toque no ponto exato. As paradas marcadas aparecem no mapa do passeio,
                      ligadas pela rota.
                    </p>
                  </div>
                )}
              </div>

              {!isFirst && (
                <Button
                  type="button"
                  variant="ghost"
                  size="inline"
                  className="mt-3"
                  onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                >
                  Remover parada<span className="sr-only"> {index + 1}</span>
                </Button>
              )}
            </li>
          );
        })}
      </ol>

      {canAdd && (
        <Button type="button" variant="outline" onClick={add} className="w-full sm:w-fit">
          Incluir parada
        </Button>
      )}
      {!canAdd && (
        <FieldDescription>Vinte paradas é o limite do roteiro.</FieldDescription>
      )}
    </fieldset>
  );
}
