import { groupMods, type ModItem } from "@/server/bike-models";

// A bike's modifications as the group reads them: one short line per category.
export function BikeMods({ mods }: { mods: ModItem[] }) {
  const groups = groupMods(mods);

  if (groups.length === 0) return null;

  return (
    <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
      {groups.map((group) => (
        <div key={group.value} className="contents">
          <dt className="label pt-0.5 text-muted-foreground">{group.label}</dt>
          <dd className="mb-1 sm:mb-0">{group.items.map((item) => item.description).join(" · ")}</dd>
        </div>
      ))}
    </dl>
  );
}
