import Image from "next/image";
import Link from "next/link";

import logo from "@assets/logo-scrambler-rj.webp";

import { signOutAction } from "@/app/actions";
import { PanelNav } from "@/components/app/panel-nav";
import type { Viewer } from "@/server/session";

type AppShellProps = {
  viewer: Viewer;
  pendingCount?: number;
  // Management pages get a second row with the panel sections.
  area?: "riders" | "painel";
  children: React.ReactNode;
};

const navLink =
  "label inline-flex min-h-11 shrink-0 items-center gap-2 text-cream-dim hover:text-cream aria-[current=page]:text-cream";

export function AppShell({ viewer, pendingCount = 0, area = "riders", children }: AppShellProps) {
  const showsPanelLink = viewer.isAdmin;
  const showsPanelNav = viewer.isAdmin && area === "painel";
  const hasPending = pendingCount > 0;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-cream/15 py-3">
        <Link href="/inicio" className="label flex min-h-11 items-center gap-2.5">
          <Image src={logo} alt="" width={36} height={36} />
          Scrambler RJ
        </Link>

        <nav
          aria-label="Principal"
          className="-mx-4 flex w-[calc(100%+2rem)] items-center gap-x-5 overflow-x-auto px-4 whitespace-nowrap [scrollbar-width:none] sm:mx-0 sm:w-auto sm:px-0"
        >
          <Link href="/inicio" className={navLink}>
            Início
          </Link>
          <Link href="/passeios" className={navLink}>
            Passeios
          </Link>
          <Link href="/vestuario" className={navLink}>
            Vestuário
          </Link>
          <Link href="/grupo" className={navLink}>
            Riders
          </Link>
          <Link href="/perfil" className={navLink}>
            Perfil
          </Link>
          {showsPanelLink && (
            <Link href="/painel" className={navLink}>
              Painel
              {hasPending && (
                <span className="rounded-sm bg-ember px-1.5 py-0.5 text-asphalt">
                  <span className="sr-only">pedidos de ingresso pendentes: </span>
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          <form action={signOutAction}>
            <button type="submit" className={`${navLink} cursor-pointer`}>
              Sair
            </button>
          </form>
        </nav>
      </header>

      {showsPanelNav && <PanelNav pendingCount={pendingCount} />}

      <main className="flex-1 py-10 sm:py-14">{children}</main>
    </div>
  );
}
