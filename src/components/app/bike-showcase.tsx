import { BikeMods } from "@/components/app/bike-mods";
import { BikePhoto } from "@/components/app/bike-photo";
import { countLabel } from "@/components/app/format";
import { Badge } from "@/components/ui/badge";
import { describeBike } from "@/server/bike-models";
import type { BikeSummary } from "@/server/profiles";

type BikeShowcaseProps = {
  bikes: BikeSummary[];
  // What the owner can do with each bike. Absent on someone else's profile.
  renderActions?: (bike: BikeSummary) => React.ReactNode;
};

// A person's bikes as the group sees them: the main one large, with its sheet, and the rest
// in a grid below.
export function BikeShowcase({ bikes, renderActions }: BikeShowcaseProps) {
  const main = bikes.find((bike) => bike.isMain) ?? bikes[0];
  const others = bikes.filter((bike) => bike.id !== main?.id);
  const hasOthers = others.length > 0;
  const hasActions = renderActions !== undefined;

  if (!main) return null;

  const hasMainNickname = main.nickname !== null;
  const sheet = [
    { label: "Cilindrada", value: `${main.engineSize} cc` },
    { label: "Ano", value: main.year ? String(main.year) : null },
    { label: "Cor", value: main.color },
    { label: "Autonomia", value: main.rangeKm ? `${main.rangeKm} km` : null },
  ].filter((item) => item.value !== null);

  return (
    <section aria-labelledby="bikes-title" className="mt-12">
      <h2 id="bikes-title" className="label text-foreground">
        {countLabel(bikes.length, "moto", "motos")}
      </h2>

      <article className="mt-4 overflow-hidden rounded-sm bg-card sm:grid sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <BikePhoto
          photoKey={main.photoKey}
          className="w-full sm:h-full"
          sizes="(min-width: 640px) 32rem, 100vw"
        />
        <div className="p-5">
          <Badge>Principal</Badge>
          {hasMainNickname && <p className="label mt-4 text-highlight">{main.nickname}</p>}
          <h3 className={`display text-3xl ${hasMainNickname ? "mt-1" : "mt-4"}`}>{main.model}</h3>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
            {sheet.map((item) => (
              <div key={item.label}>
                <dt className="label text-muted-foreground">{item.label}</dt>
                <dd className="mt-0.5 text-lg leading-tight font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
          <BikeMods mods={main.mods} />
          {hasActions && (
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-border pt-2">
              {renderActions(main)}
            </div>
          )}
        </div>
      </article>

      {hasOthers && (
        <ul className="mt-5 grid gap-5 sm:grid-cols-2">
          {others.map((bike) => {
            const hasNickname = bike.nickname !== null;

            return (
              <li key={bike.id} className="flex flex-col overflow-hidden rounded-sm bg-card">
                <BikePhoto
                  photoKey={bike.photoKey}
                  className="w-full"
                  sizes="(min-width: 640px) 26rem, 100vw"
                />
                <div className="flex flex-1 flex-col p-5">
                  {hasNickname && <p className="label text-highlight">{bike.nickname}</p>}
                  <h3 className="display text-xl">{bike.model}</h3>
                  <p className="mt-1 text-sm text-cream-dim">{describeBike(bike)}</p>
                  <BikeMods mods={bike.mods} />
                  {hasActions && (
                    <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-1 pt-3">
                      {renderActions(bike)}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
