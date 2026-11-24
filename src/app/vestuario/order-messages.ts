import type { OrderError } from "@/server/orders";

export const orderErrorMessages: Record<OrderError["code"], string> = {
  FORBIDDEN: "Você não tem permissão para fazer isso.",
  NOT_FOUND: "Este pedido não existe mais. Recarregue a página.",
  BATCH_NOT_OPEN: "A campanha não aceita mais mudanças nos pedidos.",
  ORDER_LOCKED: "Seu pedido já foi marcado como pago e não pode mais ser alterado.",
  ORDER_PAID: "Pedido pago não pode ser cancelado. Desfaça o pagamento antes, com o motivo.",
  INVALID_STATE: "A situação do pagamento mudou. Recarregue a página.",
  REASON_REQUIRED: "Escreva o motivo, com pelo menos 3 letras.",
  INVALID_INPUT: "Escolha ao menos uma peça, com cor e tamanho desta campanha.",
};
