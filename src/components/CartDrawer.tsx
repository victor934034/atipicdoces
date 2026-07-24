"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import {
  IconBag,
  IconCake,
  IconClose,
  IconMapPin,
  IconMinus,
  IconPlus,
  IconSend,
} from "@/components/icons";
import { Spinner } from "@/components/Spinner";
import { useMountTransition } from "@/hooks/useMountTransition";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  whatsappNumber: string;
};

const TRANSITION_MS = 250;

export function CartDrawer({ open, onClose, whatsappNumber }: CartDrawerProps) {
  const { items, setQuantity, totalPrice, clear } = useCart();
  const { shouldRender, visible } = useMountTransition(open, TRANSITION_MS);
  const [checkingOut, setCheckingOut] = useState(false);

  if (!shouldRender) return null;

  async function handleCheckout() {
    setCheckingOut(true);

    // Always fetch the current number instead of trusting whatever was
    // loaded when the page first opened, so admin changes take effect
    // immediately even on a tab that's been open for a while.
    let freshNumber = whatsappNumber;
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.whatsappNumber) freshNumber = data.whatsappNumber;
      }
    } catch {
      // fall back to the number already loaded on this page
    }

    fetch("/api/analytics/checkout-click", { method: "POST" }).catch(() => {});
    const link = buildWhatsAppLink(items, totalPrice, freshNumber);
    window.open(link, "_blank");
    clear();
    setCheckingOut(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-[250ms] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col transition-transform duration-[250ms] ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-lg text-gray-800">Seu carrinho</h2>
          <button
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer transition active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-5 mt-4 flex items-start gap-3 rounded-2xl bg-mint-50 border border-mint-100 p-3.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
            <IconMapPin className="w-4 h-4 text-mint-600" />
          </div>
          <div className="text-xs text-mint-800 leading-relaxed">
            <p className="font-semibold mb-0.5">Retirada no local</p>
            <p>
              Você pode vir buscar pessoalmente ou pedir um Uber Entrega para retirar por você.
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && (
            <div className="text-center mt-16 space-y-3 animate-[fade-in_300ms_ease-out]">
              <IconBag className="w-12 h-12 mx-auto text-gray-300" />
              <p className="text-gray-500 text-sm">Seu carrinho está vazio.</p>
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 animate-[fade-in_200ms_ease-out]"
            >
              <div className="w-14 h-14 rounded-xl bg-mint-50 overflow-hidden shrink-0 flex items-center justify-center">
                {item.product.photoUrl ? (
                  <img
                    src={item.product.photoUrl}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <IconCake className="w-6 h-6 text-mint-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product.title}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity}x {formatPrice(item.product.price)} ={" "}
                  <span className="font-medium text-peach-600">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                  aria-label="Diminuir quantidade"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-mint-100 text-mint-700 hover:bg-mint-200 active:scale-90 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
                >
                  <IconMinus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-medium tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                  aria-label="Aumentar quantidade"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-mint-500 text-white hover:bg-mint-600 active:scale-90 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-gray-100 space-y-3 bg-mint-50/50">
          <div className="flex items-center justify-between font-semibold text-lg">
            <span className="text-gray-700">Total</span>
            <span className="text-peach-600 transition-all duration-200">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || checkingOut}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-peach-500 text-white font-semibold py-3.5 hover:bg-peach-600 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-600 focus-visible:ring-offset-2"
          >
            {checkingOut ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <>
                <span>Finalizar pedido</span>
                <IconSend className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
