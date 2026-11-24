import type { Metadata } from "next";

import { signOutAction } from "@/app/actions";
import { GateScreen } from "@/components/app/gate-screen";
import { Button } from "@/components/ui/button";
import { requireState } from "@/server/session";

export const metadata: Metadata = { title: "Situação do pedido | Scrambler RJ" };

const messages = {
  pending: {
    title: "Pedido em avaliação",
    body: "Um administrador do grupo vai avaliar seu pedido. Quando sair a decisão, é só entrar de novo por este mesmo endereço.",
  },
  rejected: {
    title: "Seu pedido não foi aprovado",
    body: "Se achar que foi engano, fale com quem te passou o link.",
  },
  blocked: {
    title: "Seu acesso está suspenso",
    body: "Fale com um administrador do grupo.",
  },
};

export default async function RequestStatusPage() {
  const viewer = await requireState("pending", "rejected", "blocked");
  const message = messages[viewer.state as keyof typeof messages];

  return (
    <GateScreen title={message.title}>
      <p className="mt-4 leading-relaxed text-cream-dim">{message.body}</p>

      <form action={signOutAction} className="mt-8">
        <Button type="submit" variant="outline" className="w-full">
          Sair
        </Button>
      </form>
    </GateScreen>
  );
}
