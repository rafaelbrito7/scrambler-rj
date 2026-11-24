import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteOrder, saveOrder } from "@/app/vestuario/[id]/actions";
import { OrderBuilder } from "@/app/vestuario/[id]/order-builder";
import { OrderSummary } from "@/app/vestuario/[id]/order-summary";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { BatchStatusBadge, PaymentBadge } from "@/components/app/status-badge";
import { countLabel, formatPrice } from "@/components/app/format";
import { PeopleStack } from "@/components/app/people-stack";
import { Alert } from "@/components/ui/alert";
import { BatchError } from "@/server/batches";
import { access, batches, orders, profiles } from "@/server/services";
import { requireParticipant } from "@/server/session";
import { suggestSize } from "@/server/sizes";

export const metadata: Metadata = { title: "Vestuário | Scrambler RJ" };

const notices: Record<string, string> = {
  "pedido-salvo": "Pedido salvo. Dá para mudar enquanto a campanha estiver aberta e o pagamento pendente.",
  "pedido-excluido": "Pedido excluído.",
};

const closedMessages = {
  CLOSED: "Esta campanha está fechada e não aceita novos pedidos.",
  CANCELLED: "Esta campanha foi cancelada.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aviso?: string }>;
};

async function findBatch(userId: string, batchId: string) {
  try {
    return await batches.getBatch(userId, batchId);
  } catch (error) {
    if (error instanceof BatchError && error.code === "NOT_FOUND") notFound();

    throw error;
  }
}

export default async function BatchPage({ params, searchParams }: PageProps) {
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  const viewer = await requireParticipant(`/vestuario/${id}`);
  const [batch, pendingCount] = await Promise.all([
    findBatch(viewer.userId, id),
    viewer.isAdmin ? access.countPending(viewer.userId) : 0,
  ]);
  const [visibleOrders, ownProfile, statsByBatch] = await Promise.all([
    orders.listOrders(viewer.userId, batch.id),
    profiles.getOwnProfile(viewer.userId),
    orders.summarizeBatches(viewer.userId, [batch]),
  ]);
  const orderers = statsByBatch.get(batch.id)?.people ?? [];
  const suggestedSize = suggestSize(ownProfile.shirtSize, batch.sizes);
  const groupOrders = visibleOrders.filter((order) => !order.isCancelled);
  const myOrder = groupOrders.find((order) => order.isMine);
  const wasCancelled = visibleOrders.some((order) => order.isMine && order.isCancelled);
  const colors = batch.colors.map((color) => ({
    id: color.id,
    name: color.name,
    photoUrl: `/fotos/${color.photoKey}`,
  }));
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const isOpen = batch.status === "OPEN";
  const isPaid = myOrder?.paymentStatus === "PAID";
  const canOrder = isOpen && !isPaid;
  const hasMyOrder = myOrder !== undefined;
  const hasGroupOrders = groupOrders.length > 0;
  const backHref = isOpen ? "/inicio" : "/vestuario";
  const backLabel = isOpen ? "Campanhas ativas" : "Vestuário";
  const lockedMessage = isOpen
    ? "Seu pedido já foi pago e não pode mais ser alterado por aqui."
    : closedMessages[batch.status === "CANCELLED" ? "CANCELLED" : "CLOSED"];

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount}>
      <BackLink href={backHref}>{backLabel}</BackLink>

      {hasNotice && (
        <Alert role="status" className="mb-6">
          {notice}
        </Alert>
      )}

      {wasCancelled && (
        <Alert variant="destructive" role="status" className="mb-6">
          Seu pedido nesta campanha foi cancelado por um administrador.
        </Alert>
      )}

      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-[1fr_minmax(0,24rem)] sm:grid-rows-[auto_1fr]">
        <div>
          {!isOpen && <BatchStatusBadge status={batch.status} />}
          <h1 className={`display text-[clamp(2rem,6vw,2.75rem)] ${isOpen ? "" : "mt-3"}`}>
            {batch.model}
          </h1>
          <p className="mt-3 text-2xl font-semibold">{formatPrice(batch.unitPriceCents)}</p>
          <p className="mt-1 text-sm text-cream-dim">
            por peça, em qualquer cor e tamanho · {batch.sizes.join(", ")}
          </p>
        </div>

        {canOrder && (
          <OrderBuilder
            title={hasMyOrder ? "Seu pedido" : "Fazer pedido"}
            submitLabel={hasMyOrder ? "Salvar pedido" : "Enviar pedido"}
            saveAction={saveOrder}
            deleteAction={deleteOrder}
            fields={{ batchId: batch.id }}
            suggestedSize={suggestedSize}
            model={batch.model}
            unitPriceCents={batch.unitPriceCents}
            sizes={batch.sizes}
            colors={colors}
            initialItems={myOrder?.items ?? []}
          />
        )}
        {!canOrder && (
          <OrderSummary model={batch.model} colors={colors}>
            <p className="max-w-[26rem] leading-relaxed text-cream-dim">{lockedMessage}</p>

            {hasMyOrder && (
              <>
                <h2 className="label mt-6 text-muted-foreground">Seu pedido</h2>
                <ul className="mt-2 grid gap-1">
                  {myOrder.items.map((item) => (
                    <li key={`${item.colorId}:${item.size}`} className="flex justify-between gap-4">
                      <span>
                        {item.colorName} · {item.size}
                      </span>
                      <span className="tabular-nums">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-3">
                  <PaymentBadge status={myOrder.paymentStatus} />
                  <span className="text-2xl font-semibold tabular-nums">
                    {formatPrice(myOrder.totalCents)}
                  </span>
                </p>
              </>
            )}
          </OrderSummary>
        )}
      </div>

      <section aria-labelledby="group-orders-title" className="mt-14">
        <h2 id="group-orders-title" className="label text-foreground">
          Pedidos do grupo
        </h2>
        {hasGroupOrders && (
          <div className="mt-2">
            <PeopleStack
              people={orderers}
              viewerId={viewer.userId}
              title="Quem pediu"
              label={countLabel(groupOrders.length, "pedido", "pedidos")}
              max={8}
            />
          </div>
        )}

        {hasGroupOrders && (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {groupOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div>
                  <p className="font-semibold">
                    <Link
                      href={order.isMine ? "/perfil" : `/grupo/${order.userId}`}
                      className="underline decoration-border underline-offset-4 hover:text-highlight hover:decoration-primary"
                    >
                      {order.participantName}
                    </Link>
                    {order.isMine && <span className="font-normal text-cream-dim"> (você)</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-cream-dim">
                    {order.items
                      .map((item) => `${item.quantity}× ${item.colorName} ${item.size}`)
                      .join(", ")}
                  </p>
                </div>
                <p className="flex shrink-0 items-center gap-3 tabular-nums">
                  <span className="font-semibold">{formatPrice(order.totalCents)}</span>
                  <PaymentBadge status={order.paymentStatus} />
                </p>
              </li>
            ))}
          </ul>
        )}
        {!hasGroupOrders && (
          <p className="mt-4 leading-relaxed text-cream-dim">Ninguém pediu ainda.</p>
        )}
      </section>
    </AppShell>
  );
}
