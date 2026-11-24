// PROTÓTIPO DESCARTÁVEL. Três variantes da página do passeio com roteiro, ficha, mapa,
// clima, galeria e agenda, em /passeios/prototipo?variant=A|B|C.
// Dados fictícios, nenhuma ação funciona, mapa desenhado à mão. Não promover a produção.
import Link from "next/link";
import { notFound } from "next/navigation";

import { Answer, Gallery, Heading, Outside, RouteMap, SectionTitle, Weather, ride, sheet, stops } from "@/app/passeios/prototipo/parts";
import { PrototypeSwitcher } from "@/app/passeios/prototipo/switcher";
import { VariantA } from "@/app/passeios/prototipo/variant-a";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { Badge } from "@/components/ui/badge";
import { requireParticipant } from "@/server/session";

const variants = [
  { key: "A", name: "Linha do tempo" },
  { key: "B", name: "Mapa primeiro" },
  { key: "C", name: "Abas" },
];

function VariantB() {
  return (
    <>
      <div className="relative">
        <RouteMap className="aspect-[4/3] sm:aspect-[21/9]" />
        <dl className="grid grid-cols-3 gap-px bg-border sm:grid-cols-5">
          {sheet.map((item) => (
            <div key={item.label} className="bg-background py-3 pr-3 sm:px-0">
              <dt className="label text-muted-foreground">{item.label}</dt>
              <dd className="mt-1 text-lg font-semibold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        <div>
          <Heading />
          <p className="mt-4 leading-relaxed">{ride.description}</p>
          <div className="mt-6">
            <Answer />
          </div>
          <div className="mt-6">
            <Outside />
          </div>
          <section className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <SectionTitle>Leve com você</SectionTitle>
              <p className="text-sm">{ride.requirements}</p>
            </div>
          </section>
        </div>

        <div>
          <section>
            <SectionTitle>Roteiro · {stops.length} paradas</SectionTitle>
            <ol className="grid divide-y divide-border border-y border-border">
              {stops.map((stop, index) => (
                <li key={stop.name} className="flex items-center gap-4 py-3">
                  <span className="label grid size-8 shrink-0 place-items-center rounded-full bg-card text-foreground">{index + 1}</span>
                  <span className="min-w-0 grow">
                    <span className="block truncate font-semibold">{stop.name}</span>
                    <span className="block text-sm text-cream-dim">
                      {stop.kind} · {stop.place}
                    </span>
                  </span>
                  <span className="font-semibold text-highlight">{stop.time}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="mt-8">
            <SectionTitle>Tempo no dia</SectionTitle>
            <Weather />
          </section>
        </div>
      </div>

      <section className="mt-12">
        <SectionTitle>Fotos do passeio</SectionTitle>
        <Gallery />
      </section>
    </>
  );
}

const tabs = ["Roteiro", "Mapa", "Quem vai", "Fotos"];

function VariantC({ tab }: { tab: string }) {
  const showsRoute = tab === "Roteiro";
  const showsMap = tab === "Mapa";
  const showsPeople = tab === "Quem vai";
  const showsPhotos = tab === "Fotos";

  return (
    <div className="mx-auto max-w-2xl">
      <Heading />
      <p className="mt-3 text-cream-dim">
        {sheet.map((item) => item.value).join(" · ")}
      </p>
      <div className="mt-5">
        <Answer />
      </div>

      <nav aria-label="Seções do passeio" className="mt-6 flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((name) => (
          <Link
            key={name}
            href={`?variant=C&aba=${encodeURIComponent(name)}`}
            scroll={false}
            aria-current={name === tab ? "page" : undefined}
            className="label inline-flex min-h-12 shrink-0 items-center border-b-2 border-transparent text-cream-dim aria-[current=page]:border-primary aria-[current=page]:text-cream"
          >
            {name}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {showsRoute && (
          <>
            <p className="leading-relaxed">{ride.description}</p>
            <ol className="mt-5 grid gap-3">
              {stops.map((stop, index) => (
                <li key={stop.name} className="rounded-sm bg-card p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <Badge variant="outline">
                      {index + 1} · {stop.kind}
                    </Badge>
                    <span className="font-semibold text-highlight">{stop.time}</span>
                  </div>
                  <p className="mt-2 font-semibold">{stop.name}</p>
                  <p className="text-sm text-cream-dim">{stop.place}</p>
                  {stop.note !== "" && <p className="mt-1 text-sm">{stop.note}</p>}
                </li>
              ))}
            </ol>
            <p className="mt-5">
              <span className="label text-muted-foreground">Leve com você </span>
              {ride.requirements}
            </p>
          </>
        )}
        {showsMap && (
          <div className="grid gap-5">
            <RouteMap className="aspect-square sm:aspect-video" />
            <Outside />
            <Weather />
          </div>
        )}
        {showsPeople && (
          <div className="grid gap-6">
            <p className="text-cream-dim">Aqui entram as três listas de hoje: Vão, Não vão, Sem resposta.</p>
          </div>
        )}
        {showsPhotos && <Gallery />}
      </div>
    </div>
  );
}

type PageProps = { searchParams: Promise<{ variant?: string; aba?: string }> };

export default async function RidePrototypePage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === "production") notFound();

  const viewer = await requireParticipant("/passeios/prototipo");
  const { variant = "A", aba = "Roteiro" } = await searchParams;
  const isA = variant === "A";
  const isB = variant === "B";
  const isC = variant === "C";

  return (
    <AppShell viewer={viewer}>
      <BackLink href="/inicio">Campanhas ativas</BackLink>
      {isA && <VariantA />}
      {isB && <VariantB />}
      {isC && <VariantC tab={aba} />}
      <div className="h-20" />
      <PrototypeSwitcher variants={variants} current={variant} />
    </AppShell>
  );
}
