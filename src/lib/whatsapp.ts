import { CartItem } from "./types";
import { formatPrice } from "./format";

export function buildWhatsAppMessage(items: CartItem[], total: number): string {
  const lines = items.map(
    (item) =>
      `- ${item.quantity}x ${item.product.title} — ${formatPrice(item.product.price * item.quantity)}`
  );

  return [
    "Pedido Atipic Doces:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
  ].join("\n");
}

export function buildWhatsAppLink(items: CartItem[], total: number, whatsappNumber: string): string {
  const message = buildWhatsAppMessage(items, total);
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
