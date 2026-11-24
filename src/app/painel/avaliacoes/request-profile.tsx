import Image from "next/image";

import { formatDateTime, formatWhatsapp, whatsappLink } from "@/components/app/format";
import type { JoinRequestSummary } from "@/server/access";

const detailTerm = "label text-cream-dim";
const detailValue = "mt-1 break-words";

export function RequestProfile({ request }: { request: JoinRequestSummary }) {
  const hasPhoto = request.accountImage !== null;
  const initial = request.fullName.charAt(0).toUpperCase();

  return (
    <div>
      <div className="flex items-center gap-3">
        {hasPhoto && (
          <Image
            src={request.accountImage ?? ""}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="size-12 rounded-full"
          />
        )}
        {!hasPhoto && (
          <span
            aria-hidden
            className="display flex size-12 shrink-0 items-center justify-center rounded-full bg-cream/10 text-xl"
          >
            {initial}
          </span>
        )}
        <h3 className="text-xl font-semibold">{request.fullName}</h3>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className={detailTerm}>Moto</dt>
          <dd className={detailValue}>
            {request.bikeModel}, {request.engineSize} cilindradas
          </dd>
        </div>
        <div>
          <dt className={detailTerm}>WhatsApp</dt>
          <dd className={detailValue}>
            <a
              href={whatsappLink(request.whatsapp)}
              className="underline decoration-ember underline-offset-4 hover:text-ember-hot"
            >
              {formatWhatsapp(request.whatsapp)}
            </a>
          </dd>
        </div>
        <div>
          <dt className={detailTerm}>Conta Google</dt>
          <dd className={detailValue}>
            {request.accountName}
            <span className="block text-cream-dim">{request.accountEmail}</span>
          </dd>
        </div>
        <div>
          <dt className={detailTerm}>Pedido em</dt>
          <dd className={detailValue}>{formatDateTime(request.createdAt)}</dd>
        </div>
      </dl>
    </div>
  );
}
