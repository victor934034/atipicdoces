"use client";

import { useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { IconCake, IconClose, IconMinus, IconPlus } from "@/components/icons";
import { useMountTransition } from "@/hooks/useMountTransition";

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

const TRANSITION_MS = 200;

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { items, addItem, setQuantity } = useCart();
  const { shouldRender, visible } = useMountTransition(Boolean(product), TRANSITION_MS);
  const [displayedProduct, setDisplayedProduct] = useState(product);

  useEffect(() => {
    if (product) setDisplayedProduct(product);
  }, [product]);

  const quantity = useMemo(
    () =>
      displayedProduct
        ? items.find((i) => i.product.id === displayedProduct.id)?.quantity ?? 0
        : 0,
    [items, displayedProduct]
  );

  useEffect(() => {
    if (!product) return;

    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!shouldRender || !displayedProduct) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={displayedProduct.title}
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-[200ms] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col transition-all duration-[200ms] ease-out ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm cursor-pointer transition active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
        >
          <IconClose className="w-5 h-5" />
        </button>

        <div className="w-full aspect-[4/3] bg-mint-50 shrink-0">
          {displayedProduct.photoUrl ? (
            <img
              src={displayedProduct.photoUrl}
              alt={displayedProduct.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <IconCake className="w-16 h-16 text-mint-300" />
            </div>
          )}
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div>
            <span className="inline-block bg-mint-50 text-mint-700 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
              {displayedProduct.category}
            </span>
            <h2 className="text-xl font-semibold text-gray-800 leading-tight">
              {displayedProduct.title}
            </h2>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">{displayedProduct.description}</p>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="font-bold text-peach-600 text-2xl">
              {formatPrice(displayedProduct.price)}
            </span>

            {quantity === 0 ? (
              <button
                onClick={() => addItem(displayedProduct)}
                className="px-5 py-2.5 rounded-full bg-mint-500 text-white font-medium hover:bg-mint-600 active:scale-95 transition shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2"
              >
                Adicionar
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-mint-50 rounded-full px-2 py-1.5">
                <button
                  onClick={() => setQuantity(displayedProduct.id, quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-mint-700 shadow-sm cursor-pointer active:scale-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
                  aria-label="Diminuir quantidade"
                >
                  <IconMinus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-medium text-mint-700 tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => addItem(displayedProduct)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-mint-500 text-white cursor-pointer active:scale-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
                  aria-label="Aumentar quantidade"
                >
                  <IconPlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
