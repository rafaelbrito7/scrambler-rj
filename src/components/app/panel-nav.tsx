"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/painel/avaliacoes", label: "Avaliações" },
  { href: "/painel/riders", label: "Gestão de riders" },
  { href: "/painel/vestuario", label: "Vestuário" },
  { href: "/painel/passeios", label: "Passeios" },
];

export function PanelNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const hasPending = pendingCount > 0;

  return (
    <nav
      aria-label="Painel de gerenciamento"
      className="-mx-4 overflow-x-auto border-b border-cream/15 px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex gap-6">
        {sections.map((section) => {
          // Templates live under Vestuário: they only exist to open batches.
          const isRecipes = section.href === "/painel/vestuario" && pathname.startsWith("/painel/templates");
          const isCurrent = pathname.startsWith(section.href) || isRecipes;
          const showsCount = hasPending && section.href === "/painel/avaliacoes";

          return (
            <li key={section.href} className="shrink-0">
              <Link
                href={section.href}
                aria-current={isCurrent ? "page" : undefined}
                className="label inline-flex min-h-12 items-center gap-2 border-b-2 border-transparent text-cream-dim hover:text-cream aria-[current=page]:border-primary aria-[current=page]:text-cream"
              >
                {section.label}
                {showsCount && (
                  <span className="rounded-sm bg-ember px-1.5 py-0.5 text-asphalt">
                    <span className="sr-only">pendentes: </span>
                    {pendingCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
