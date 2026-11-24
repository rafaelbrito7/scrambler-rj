import Image from "next/image";
import Link from "next/link";

import { countLabel, formatPrice } from "@/components/app/format";
import { PeopleStack } from "@/components/app/people-stack";
import { PaymentBadge } from "@/components/app/status-badge";
import { buttonVariants } from "@/components/ui/button";
import type { BatchSummary } from "@/server/batches";
import type { BatchOrderStats } from "@/server/orders";

type BatchCardProps = {
  batch: BatchSummary;
  stats: BatchOrderStats;
  viewerId: string;
  isFirst: boolean;
};

// An open campaign: the garment, who has ordered and where the person's own order stands.
export function BatchCard({ batch, stats, viewerId, isFirst }: BatchCardProps) {
  const href = `/vestuario/${batch.id}`;
  const mine = stats.mine;
  const hasOrdered = mine !== null;
  const hasGroupOrders = stats.orderCount > 0;
  const ordersLabel = hasGroupOrders
    ? `${countLabel(stats.orderCount, "pedido", "pedidos")} · ${countLabel(stats.pieceCount, "peça", "peças")}`
    : "Ninguém pediu ainda";

  return (
    <li className="flex flex-col rounded-sm bg-card">
      <Link href={href} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-sm">
          <Image
            src={`/fotos/${batch.colors[0].photoKey}`}
            alt=""
            fill
            unoptimized
            priority={isFirst}
            sizes="(min-width: 640px) 26rem, 100vw"
            className="object-cover"
          />
        </div>
        <div className="px-5 pt-5">
          <h3 className="display text-2xl group-hover:underline group-hover:underline-offset-4">
            {batch.model}
          </h3>
          <p className="mt-2">
            <span className="text-lg font-semibold">{formatPrice(batch.unitPriceCents)}</span> por peça
          </p>
        </div>
      </Link>

      <div className="px-5 pt-2">
        <PeopleStack people={stats.people} viewerId={viewerId} title="Quem pediu" label={ordersLabel} />
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-end gap-3 border-t border-border p-5">
        {hasOrdered && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">
                Seu pedido: {countLabel(mine.pieces, "peça", "peças")} · {formatPrice(mine.totalCents)}
              </p>
              <div className="mt-2">
                <PaymentBadge status={mine.paymentStatus} />
              </div>
            </div>
            <Link href={href} className={buttonVariants({ variant: "ghost", size: "inline" })}>
              Ver<span className="sr-only"> pedido de {batch.model}</span>
            </Link>
          </div>
        )}
        {!hasOrdered && (
          <>
            <p className="font-semibold">Você ainda não pediu</p>
            <Link href={href} className={buttonVariants({ className: "w-full" })}>
              Fazer pedido<span className="sr-only"> de {batch.model}</span>
            </Link>
          </>
        )}
      </div>
    </li>
  );
}
