import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderBuilder } from "@/app/vestuario/[id]/order-builder";
import { saveOrderAsAdmin } from "@/app/painel/vestuario/[id]/actions";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { formatPrice } from "@/components/app/format";
import { PaymentBadge } from "@/components/app/status-badge";
import { BatchError } from "@/server/batches";
import { access, batches, orders } from "@/server/services";
import { requireAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Editar pedido | Scrambler RJ" };

type PageProps = {
  params: Promise<{ id: string; orderId: string }>;
};

async function findBatch(userId: string, batchId: string) {
  try {
    return await batches.getBatch(userId, batchId);
  } catch (error) {
    if (error instanceof BatchError && error.code === "NOT_FOUND") notFound();

    throw error;
  }
}

export default async function EditOrderPage({ params }: PageProps) {
  const viewer = await requireAdmin();
  const { id, orderId } = await params;
  const [batch, pendingCount] = await Promise.all([
    findBatch(viewer.userId, id),
    access.countPending(viewer.userId),
  ]);
  const managedOrders = await orders.listManagedOrders(viewer.userId, batch.id);
  const order = managedOrders.find((candidate) => candidate.id === orderId);

  if (!order || batch.status === "CANCELLED") notFound();

  const isPaid = order.paymentStatus === "PAID";
  const colors = batch.colors.map((color) => ({
    id: color.id,
    name: color.name,
    photoUrl: `/fotos/${color.photoKey}`,
  }));

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href={`/painel/vestuario/${batch.id}`}>Pedidos da campanha</BackLink>

      <div className="grid gap-x-10 gap-y-6 sm:grid-cols-[1fr_minmax(0,24rem)] sm:grid-rows-[auto_1fr]">
        <div>
          <p className="flex flex-wrap items-center gap-3">
            <span className="label text-muted-foreground">{batch.model}</span>
            <PaymentBadge status={order.paymentStatus} />
          </p>
          <h1 className="display mt-3 text-[clamp(2rem,6vw,2.75rem)]">
            Pedido de {order.participantName}
          </h1>
          <p className="mt-3 text-cream-dim">{formatPrice(batch.unitPriceCents)} por peça</p>
        </div>

        <OrderBuilder
          title="Combinações"
          submitLabel="Salvar pedido"
          saveAction={saveOrderAsAdmin}
          fields={{ batchId: batch.id, orderId: order.id }}
          warnsAboutPaymentReset={isPaid}
          model={batch.model}
          unitPriceCents={batch.unitPriceCents}
          sizes={batch.sizes}
          colors={colors}
          initialItems={order.items}
        />
      </div>
    </AppShell>
  );
}
