// PROTÓTIPO DESCARTÁVEL: variante A, linha do tempo, com identidade por seção.
import {
  BackpackIcon,
  CameraIcon,
  CheckCircleIcon,
  CloudRainIcon,
  CloudSunIcon,
  CoffeeIcon,
  CoinsIcon,
  DropIcon,
  ForkKnifeIcon,
  GasPumpIcon,
  GaugeIcon,
  HouseIcon,
  ImagesIcon,
  MapPinIcon,
  MapTrifoldIcon,
  PathIcon,
  RoadHorizonIcon,
  SignpostIcon,
  SunIcon,
  TimerIcon,
  UmbrellaIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Answer, Gallery, Heading, RouteMap, ride, stops } from "@/app/passeios/prototipo/parts";

const sheet: { label: string; value: string; unit: string; icon: Icon }[] = [
  { label: "Distância", value: "142", unit: "km", icon: PathIcon },
  { label: "Tempo de rolé", value: "3h20", unit: "", icon: TimerIcon },
  { label: "Piso", value: "Asfalto", unit: "", icon: RoadHorizonIcon },
  { label: "Dificuldade", value: "Moderado", unit: "", icon: GaugeIcon },
  { label: "Pedágios", value: "R$ 14", unit: "", icon: CoinsIcon },
];

const stopIcons: Record<string, Icon> = {
  Encontro: MapPinIcon,
  Abastecimento: GasPumpIcon,
  Mirante: CameraIcon,
  Café: CoffeeIcon,
  Destino: ForkKnifeIcon,
  Retorno: HouseIcon,
};

const packing = [
  { text: "Tanque cheio na saída", icon: GasPumpIcon },
  { text: "Capa de chuva na mochila", icon: UmbrellaIcon },
  { text: "Dinheiro para pedágio e almoço", icon: CoinsIcon },
];

const forecast = [
  { where: "No encontro", time: "7h", temp: "22°", rain: "10%", icon: SunIcon },
  { where: "No destino", time: "12h", temp: "17°", rain: "35%", icon: CloudSunIcon },
];

function Section({ icon: SectionIcon, title, children }: { icon: Icon; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 border-b border-border pb-3">
        <SectionIcon aria-hidden weight="fill" className="size-5 text-highlight" />
        <span className="label text-foreground">{title}</span>
      </h2>
      {children}
    </section>
  );
}

export function VariantA() {
  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
      <div className="grid content-start gap-10">
        <div>
          <Heading />
          <p className="mt-4 leading-relaxed">{ride.description}</p>

          <div className="mt-6 sm:hidden">
            <Answer />
          </div>

          <dl className="mt-6 flex flex-wrap gap-2">
            {sheet.map(({ label, value, unit, icon: SheetIcon }) => (
              <div key={label} className="min-w-32 grow basis-0 rounded-sm bg-card p-3">
                <SheetIcon aria-hidden className="size-5 text-highlight" />
                <dt className="label mt-3 text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 text-lg leading-tight font-semibold">
                  {value}
                  {unit !== "" && <span className="ml-1 text-sm font-normal text-cream-dim">{unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Section icon={SignpostIcon} title={`Roteiro · ${stops.length} paradas`}>
          <ol className="grid">
            {stops.map((stop, index) => {
              const StopIcon = stopIcons[stop.kind];
              const isEdge = index === 0 || stop.kind === "Destino";
              const isLast = index === stops.length - 1;

              return (
                <li key={stop.name} className="grid grid-cols-[3.25rem_2.25rem_minmax(0,1fr)] gap-x-3">
                  <span className="pt-1.5 text-right font-semibold text-highlight">{stop.time}</span>
                  <span className="flex flex-col items-center">
                    <span
                      className={`grid size-9 place-items-center rounded-full ${isEdge ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`}
                    >
                      <StopIcon aria-hidden weight={isEdge ? "fill" : "regular"} className="size-[1.125rem]" />
                    </span>
                    {!isLast && <span className="w-px grow bg-border" />}
                  </span>
                  <div className="pb-6">
                    <p className="label pt-0.5 text-muted-foreground">
                      {index + 1} · {stop.kind}
                    </p>
                    <p className="font-semibold">{stop.name}</p>
                    <p className="text-sm text-cream-dim">{stop.place}</p>
                    {stop.note !== "" && <p className="mt-1 text-sm">{stop.note}</p>}
                    <Link href="#" className="mt-1 inline-flex min-h-11 items-center text-sm underline decoration-primary underline-offset-4">
                      Abrir no mapa
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>

        <Section icon={BackpackIcon} title="Leve com você">
          <ul className="grid gap-2 sm:grid-cols-3">
            {packing.map(({ text, icon: ItemIcon }) => (
              <li key={text} className="flex items-center gap-3 rounded-sm border border-border p-3">
                <ItemIcon aria-hidden className="size-6 shrink-0 text-cream-dim" />
                <span className="text-sm leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ImagesIcon} title="Fotos do passeio">
          <Gallery />
        </Section>
      </div>

      <aside className="grid min-w-0 content-start gap-8 sm:sticky sm:top-6 sm:self-start">
        <div className="hidden sm:block">
          <Answer />
        </div>

        <Section icon={MapTrifoldIcon} title="Mapa da rota">
          <RouteMap className="aspect-[4/3]" />
          <div className="mt-4 grid gap-3">
            <Button variant="outline">Abrir no Google Maps</Button>
            <Button variant="ghost">Adicionar à agenda</Button>
          </div>
        </Section>

        <Section icon={CloudSunIcon} title="Tempo no dia">
          <ul className="grid grid-cols-2 gap-2">
            {forecast.map(({ where, time, temp, rain, icon: SkyIcon }) => (
              <li key={where} className="rounded-sm bg-card p-3">
                <p className="label text-muted-foreground">
                  {where} · {time}
                </p>
                <p className="mt-2 flex items-center gap-2">
                  <SkyIcon aria-hidden weight="fill" className="size-7 text-highlight" />
                  <span className="text-3xl leading-none font-semibold">{temp}</span>
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-cream-dim">
                  <DropIcon aria-hidden className="size-4" />
                  {rain} de chuva
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex gap-3 rounded-sm border border-border p-3 text-sm leading-snug">
            <CloudRainIcon aria-hidden className="size-5 shrink-0 text-cream-dim" />
            <span>
              <span className="label block text-muted-foreground">Plano B</span>
              {ride.planB}
            </span>
          </p>
        </Section>

        <p className="flex items-center gap-2 text-sm text-cream-dim">
          <CheckCircleIcon aria-hidden className="size-4" />
          Previsão e rota calculadas na publicação; previsão atualizada hoje.
        </p>
      </aside>
    </div>
  );
}
