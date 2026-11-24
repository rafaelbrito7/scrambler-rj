import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cancelOrder, changeBatchStatus, markOrderPaid } from "@/app/painel/vestuario/[id]/actions";
import { UndoPayment } from "@/app/painel/vestuario/[id]/undo-payment";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { ConfirmAction } from "@/components/app/confirm-action";
import { BatchStatusBadge, PaymentBadge } from "@/components/app/status-badge";
import { CopySummary } from "@/components/app/copy-summary";
import { formatDateTime, formatPrice } from "@/components/app/format";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { BatchError } from "@/server/batches";
import type { PaymentEventSummary } from "@/server/orders";
import { getOrigin } from "@/server/origin";
import { access, batches, orders } from "@/server/services";
import { requireAdmin } from "@/server/session";
import { buildBatchShareText } from "@/server/share-text";

export const metadata: Metadata = { title: "Pedidos da campanha | Scrambler RJ" };

const notices: Record<string, string> = {
  pago: "Pedido marcado como pago.",
  desfeito: "Pagamento desfeito. O pedido voltou a Pendente.",
  editado: "Pedido atualizado.",
  "editado-pendente": "Pedido atualizado. O total mudou, então ele voltou a Pendente.",
  mudou: "A situação desse pedido já tinha mudado. Confira a lista.",
  "pedido-cancelado": "Pedido cancelado. Ele saiu das contas da campanha e ficou no histórico.",
  "pedido-pago": "Pedido pago não pode ser cancelado. Desfaça o pagamento antes, com o motivo.",
  fechado: "Campanha fechada. Saiu do Início e não aceita mudanças dos riders.",
  reaberto: "Campanha reaberta. Voltou ao Início e os pendentes podem ser editados.",
  cancelado: "Campanha cancelada. Os pedidos ficaram como histórico.",
  "campanha-com-pago": "Há pedido pago nesta campanha, então ela não pode ser cancelada. Fechar continua permitido.",
  "campanha-mudou": "A situação da campanha já tinha mudado. Confira abaixo.",
};

function describeEvent(event: PaymentEventSummary) {
  const when = `${event.authorName}, ${formatDateTime(event.createdAt)}`;

  if (event.kind === "MARKED_PAID") return `Marcado como pago por ${when}`;
  if (event.kind === "UNDONE") return `Pagamento desfeito por ${when}. Motivo: ${event.reason}`;
  if (event.kind === "CANCELLED") return `Cancelado por ${when}`;

  return `Voltou a Pendente porque o total mudou, por ${when}`;
}

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

export default async function BatchOrdersPage({ params, searchParams }: PageProps) {
  const viewer = await requireAdmin();
  const [{ id }, { aviso }] = await Promise.all([params, searchParams]);
  const [batch, pendingCount] = await Promise.all([
    findBatch(viewer.userId, id),
    access.countPending(viewer.userId),
  ]);
  const [managedOrders, production] = await Promise.all([
    orders.listManagedOrders(viewer.userId, batch.id),
    orders.getProduction(viewer.userId, batch.id),
  ]);
  const shareText = buildBatchShareText(batch, await getOrigin());
  const notice = aviso ? notices[aviso] : undefined;
  const hasNotice = notice !== undefined;
  const liveOrders = managedOrders.filter((order) => !order.isCancelled);
  const cancelledOrders = managedOrders.filter((order) => order.isCancelled);
  const hasOrders = liveOrders.length > 0;
  const hasCancelledOrders = cancelledOrders.length > 0;
  const canManage = batch.status !== "CANCELLED";
  const paidCount = liveOrders.filter((order) => order.paymentStatus === "PAID").length;
  const isOpen = batch.status === "OPEN";
  const isClosed = batch.status === "CLOSED";
  const hasPaidOrders = paidCount > 0;
  const canCancelBatch = canManage && !hasPaidOrders;
  const showsPaidBlock = canManage && hasPaidOrders;
  const batchFields = { batchId: batch.id };
  const pendingTone = production.pendingCents > 0 ? "text-highlight" : "";

  return (
    <AppShell viewer={viewer} pendingCount={pendingCount} area="painel">
      <BackLink href="/painel/vestuario">Vestuário</BackLink>

      <div className="flex flex-col gap-5">
        <div>
          <BatchStatusBadge status={batch.status} />
          <h1 className="display mt-3 text-[clamp(2rem,6vw,2.75rem)]">{batch.model}</h1>
          <p className="mt-2 text-cream-dim">{formatPrice(batch.unitPriceCents)} por peça</p>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3">
          {isOpen && <CopySummary text={shareText} />}
          <a
            href={`/painel/vestuario/${batch.id}/relatorio`}
            download
            className={buttonVariants({ variant: "outline" })}
          >
            Baixar PDF
          </a>
          <Link href={`/vestuario/${batch.id}`} className={buttonVariants({ variant: "ghost" })}>
            Ver como rider
          </Link>
        </div>
      </div>

      {hasNotice && (
        <Alert role="status" className="mt-5">
          {notice}
        </Alert>
      )}

      {canManage && (
        <section aria-labelledby="status-title" className="mt-8 rounded-sm bg-card p-5">
          <h2 id="status-title" className="label text-foreground">
            Situação da campanha
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            {isOpen && (
              <form action={changeBatchStatus} className="w-full sm:w-auto">
                <input type="hidden" name="batchId" value={batch.id} />
                <input type="hidden" name="transition" value="fechar" />
                <Button type="submit" variant="outline" className="w-full">
                  Fechar campanha
                </Button>
              </form>
            )}
            {isClosed && (
              <form action={changeBatchStatus} className="w-full sm:w-auto">
                <input type="hidden" name="batchId" value={batch.id} />
                <input type="hidden" name="transition" value="reabrir" />
                <Button type="submit" variant="outline" className="w-full">
                  Reabrir campanha
                </Button>
              </form>
            )}
            {canCancelBatch && (
              <ConfirmAction
                label="Cancelar campanha"
                question="Cancelar esta campanha? Ela sai do Início de vez e não pode ser reaberta. Os pedidos ficam como histórico."
                confirmLabel="Sim, cancelar campanha"
                keepLabel="Manter campanha"
                action={changeBatchStatus}
                fields={{ ...batchFields, transition: "cancelar" }}
              />
            )}
          </div>
          <p className="mt-3 text-sm text-cream-dim">
            {isOpen
              ? "Fechar tira a campanha do Início e trava os pedidos dos riders. Dá para reabrir."
              : "Fechada: fora do Início. Você ainda pode editar pedidos e marcar pagamentos."}
            {showsPaidBlock && " Com pedido pago, a campanha não pode ser cancelada."}
          </p>
        </section>
      )}

      {hasOrders && (
        <section aria-labelledby="production-title" className="mt-10">
          <h2 id="production-title" className="label text-foreground">
            Produção
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-right tabular-nums">
              <caption className="sr-only">Peças por cor e tamanho, sem pedidos cancelados</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="label py-2 pr-3 text-left text-muted-foreground">
                    Cor
                  </th>
                  {production.sizes.map((size) => (
                    <th key={size} scope="col" className="label min-w-10 px-2 py-2 text-muted-foreground">
                      {size}
                    </th>
                  ))}
                  <th scope="col" className="label py-2 pl-3 text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {production.rows.map((row) => (
                  <tr key={row.colorId} className="border-b border-border">
                    <th scope="row" className="py-3 pr-3 text-left font-normal">
                      {row.colorName}
                    </th>
                    {row.quantities.map((quantity, index) => (
                      <td
                        key={production.sizes[index]}
                        className={quantity === 0 ? "px-2 py-3 text-cream-dim" : "px-2 py-3"}
                      >
                        {quantity}
                      </td>
                    ))}
                    <td className="py-3 pl-3 font-semibold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="label py-3 pr-3 text-left text-muted-foreground">
                    Total
                  </th>
                  {production.sizeTotals.map((total, index) => (
                    <td key={production.sizes[index]} className="px-2 py-3 font-semibold">
                      {total}
                    </td>
                  ))}
                  <td className="py-3 pl-3 text-lg font-semibold">{production.totalPieces}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="border-t-2 border-foreground bg-card p-4">
              <dt className="label text-muted-foreground">Pago</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {formatPrice(production.paidCents)}
              </dd>
            </div>
            <div className="border-t-2 border-primary bg-card p-4">
              <dt className="label text-muted-foreground">Pendente</dt>
              <dd className={`mt-1 text-2xl font-semibold tabular-nums ${pendingTone}`}>
                {formatPrice(production.pendingCents)}
              </dd>
            </div>
            <div className="border-t-2 border-border bg-card p-4">
              <dt className="label text-muted-foreground">Total da campanha</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {formatPrice(production.totalCents)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section aria-labelledby="orders-title" className="mt-10">
        <h2 id="orders-title" className="label text-foreground">
          Pedidos: {liveOrders.length} · Pagos: {paidCount}
        </h2>

        {hasOrders && (
          <ul className="mt-4 grid gap-4">
            {liveOrders.map((order) => {
              const isPaid = order.paymentStatus === "PAID";
              const canMarkPaid = canManage && !isPaid;
              const canUndo = canManage && isPaid;
              const hasHistory = order.history.length > 0;

              return (
                <li key={order.id} className="rounded-sm bg-card p-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <div>
                      <p className="font-semibold">{order.participantName}</p>
                      <p className="mt-0.5 text-sm text-cream-dim">
                        {order.items
                          .map((item) => `${item.quantity}× ${item.colorName} ${item.size}`)
                          .join(", ")}
                      </p>
                    </div>
                    <p className="flex shrink-0 items-center gap-3 tabular-nums">
                      <span className="text-lg font-semibold">{formatPrice(order.totalCents)}</span>
                      <PaymentBadge status={order.paymentStatus} />
                    </p>
                  </div>

                  {hasHistory && (
                    <ul className="mt-3 grid gap-1 text-sm text-cream-dim">
                      {order.history.map((event) => (
                        <li key={`${event.kind}-${event.createdAt.getTime()}`}>
                          {describeEvent(event)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {canManage && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                      {canMarkPaid && (
                        <form action={markOrderPaid} className="w-full sm:w-auto">
                          <input type="hidden" name="batchId" value={batch.id} />
                          <input type="hidden" name="orderId" value={order.id} />
                          <Button type="submit" className="w-full">
                            Marcar como pago
                            <span className="sr-only"> o pedido de {order.participantName}</span>
                          </Button>
                        </form>
                      )}
                      <Link
                        href={`/painel/vestuario/${batch.id}/pedidos/${order.id}`}
                        className={buttonVariants({ variant: "ghost", size: "inline" })}
                      >
                        Editar pedido<span className="sr-only"> de {order.participantName}</span>
                      </Link>
                      {canMarkPaid && (
                        <ConfirmAction
                          label={
                            <>
                              Cancelar pedido
                              <span className="sr-only"> de {order.participantName}</span>
                            </>
                          }
                          question={`Cancelar o pedido de ${order.participantName}? Ele sai das contas da campanha e fica no histórico.`}
                          confirmLabel="Sim, cancelar pedido"
                          keepLabel="Manter pedido"
                          action={cancelOrder}
                          fields={{ ...batchFields, orderId: order.id }}
                        />
                      )}
                      {canUndo && (
                        <UndoPayment
                          batchId={batch.id}
                          orderId={order.id}
                          participantName={order.participantName}
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {!hasOrders && (
          <p className="mt-4 leading-relaxed text-cream-dim">Nenhum pedido ativo nesta campanha.</p>
        )}
      </section>

      {hasCancelledOrders && (
        <section aria-labelledby="cancelled-title" className="mt-12">
          <h2 id="cancelled-title" className="label text-foreground">
            Cancelados: {cancelledOrders.length}
          </h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {cancelledOrders.map((order) => (
              <li key={order.id} className="py-4">
                <p className="font-semibold">{order.participantName}</p>
                <p className="mt-0.5 text-sm text-cream-dim">
                  {order.items
                    .map((item) => `${item.quantity}× ${item.colorName} ${item.size}`)
                    .join(", ")}{" "}
                  · {formatPrice(order.totalCents)}
                </p>
                <p className="mt-1 text-sm text-cream-dim">{describeEvent(order.history[0])}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
