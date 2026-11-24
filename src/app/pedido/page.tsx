import type { Metadata } from "next";

import { signOutAction } from "@/app/actions";
import { JoinRequestForm } from "@/app/pedido/join-request-form";
import { GateScreen } from "@/components/app/gate-screen";
import { Button } from "@/components/ui/button";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Pedir ingresso | Scrambler RJ" };

export default async function JoinRequestPage() {
  const viewer = await requireState("none");

  return (
    <GateScreen title="Pedir ingresso no grupo">
      <p className="mt-4 leading-relaxed text-cream-dim">
        Seus dados vão para os administradores avaliarem. Confira antes de
        enviar.
      </p>

      <JoinRequestForm defaultName={viewer.name ?? ""} />

      <form action={signOutAction} className="mt-4">
        <Button type="submit" variant="ghost" className="w-full">
          Sair
        </Button>
      </form>
    </GateScreen>
  );
}
