import type { Metadata } from "next";
import Link from "next/link";

import { GateScreen } from "@/components/app/gate-screen";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Página não encontrada | Scrambler RJ" };

export default function NotFound() {
  return (
    <GateScreen title="Essa página não existe">
      <p className="mt-4 leading-relaxed text-cream-dim">
        O link pode estar errado, ou a campanha saiu do ar. As campanhas abertas ficam no Início.
      </p>

      <Link href="/" className={buttonVariants({ className: "mt-8 w-full" })}>
        Ir para o Início
      </Link>
    </GateScreen>
  );
}
