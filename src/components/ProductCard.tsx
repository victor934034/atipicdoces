"use client";

import { useMemo } from "react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { IconCake, IconMinus, IconPlus } from "@/components/icons";

type ProductCardProps = {
  product: Product;
  onOpen: (product: Product) => void;
};

export function ProductCard({ product, onOpen }: ProductCardProps) {
  const { items, addItem, setQuantity } = useCart();

  const quantity = useMemo(
    () => items.find((i) => i.product.id === product.id)?.quantity ?? 0,
    [items, product.id]
  );

  return (
    <div className="@container group bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden flex flex-col transition-shadow duration-300 animate-[card-in_300ms_ease-out]">
      <button
        onClick={() => onOpen(product)}
        className="relative w-full aspect-square bg-mint-50 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-inset"
        aria-label={`Ver detalhes de ${product.title}`}
      >
        {product.photoUrl ? (
          <img
            src={product.photoUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconCake className="w-8 h-8 @[220px]:w-12 @[220px]:h-12 text-mint-300" />
          </div>
        )}
      </button>

      <div className="p-2.5 @[220px]:p-4 flex flex-col flex-1 gap-1.5 @[220px]:gap-2">
        <button
          onClick={() => onOpen(product)}
          className="text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          <h3 className="font-semibold text-sm @[220px]:text-lg leading-tight text-gray-800 line-clamp-2 min-h-[2.2rem] @[220px]:min-h-[2.75rem]">
            {product.title}
          </h3>
        </button>
        <p className="text-xs @[220px]:text-sm text-gray-500 line-clamp-2 min-h-[2rem] @[220px]:min-h-[2.5rem]">
          {product.description}
        </p>
        <div className="mt-auto flex flex-col @[220px]:flex-row @[220px]:items-center gap-1.5 @[220px]:gap-2 @[220px]:justify-between pt-1.5 @[220px]:pt-2">
          <span className="font-bold text-peach-600 text-sm @[220px]:text-lg">
            {formatPrice(product.price)}
          </span>

          {quantity === 0 ? (
            <button
              onClick={() => addItem(product)}
              className="w-full @[220px]:w-auto px-3 py-1.5 @[220px]:px-4 @[220px]:py-2.5 min-h-[32px] @[220px]:min-h-[40px] rounded-full bg-mint-500 text-white text-xs @[220px]:text-sm font-medium hover:bg-mint-600 active:scale-95 transition cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2"
            >
              Adicionar
            </button>
          ) : (
            <div className="flex items-center justify-between @[220px]:justify-start gap-1 bg-mint-50 rounded-full p-1 animate-[pop-in_250ms_ease-out]">
              <button
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="w-7 h-7 @[220px]:w-10 @[220px]:h-10 flex items-center justify-center rounded-full bg-white text-mint-700 shadow-sm cursor-pointer active:scale-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
                aria-label="Diminuir quantidade"
              >
                <IconMinus className="w-3 h-3 @[220px]:w-4 @[220px]:h-4" />
              </button>
              <span className="w-5 @[220px]:w-6 text-center text-sm @[220px]:text-base font-medium text-mint-700 tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => addItem(product)}
                className="w-7 h-7 @[220px]:w-10 @[220px]:h-10 flex items-center justify-center rounded-full bg-mint-500 text-white cursor-pointer active:scale-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
                aria-label="Aumentar quantidade"
              >
                <IconPlus className="w-3 h-3 @[220px]:w-4 @[220px]:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
