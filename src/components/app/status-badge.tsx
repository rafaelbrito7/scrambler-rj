import { paymentLabels } from "@/components/app/format";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = "default" | "attention" | "outline" | "destructive";

type Campaign = "OPEN" | "CLOSED" | "CANCELLED";

const paymentVariants: Record<keyof typeof paymentLabels, BadgeVariant> = {
  PAID: "default",
  PENDING: "attention",
};

const campaignVariants: Record<Campaign, BadgeVariant> = {
  OPEN: "default",
  CLOSED: "outline",
  CANCELLED: "destructive",
};

const batchLabels: Record<Campaign, string> = {
  OPEN: "Aberta",
  CLOSED: "Fechada",
  CANCELLED: "Cancelada",
};

const rideLabels: Record<Campaign, string> = {
  OPEN: "Confirmações abertas",
  CLOSED: "Confirmações encerradas",
  CANCELLED: "Cancelado",
};

export function PaymentBadge({ status }: { status: keyof typeof paymentLabels }) {
  return <Badge variant={paymentVariants[status]}>{paymentLabels[status]}</Badge>;
}

export function BatchStatusBadge({ status }: { status: Campaign }) {
  return <Badge variant={campaignVariants[status]}>{batchLabels[status]}</Badge>;
}

export function RideStatusBadge({ status }: { status: Campaign }) {
  return <Badge variant={campaignVariants[status]}>{rideLabels[status]}</Badge>;
}
