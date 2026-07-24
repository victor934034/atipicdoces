"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { IconChevronRight } from "@/components/icons";

type HeaderProps = {
  categories?: string[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  onOpenCart: () => void;
  showCategories?: boolean;
};

export function Header({
  categories = [],
  activeCategory,
  onSelectCategory,
  onOpenCart,
  showCategories = true,
}: HeaderProps) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="shrink-0 cursor-pointer">
            <img
              src="/logo-clean.jpeg"
              alt="Atipic Doces"
              width={72}
              height={72}
              className="rounded-full object-cover w-11 h-11 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px]"
            />
          </Link>
          <div className="flex flex-col min-w-0 leading-tight">
            <Link
              href="/"
              className="font-brand text-xl sm:text-2xl md:text-3xl text-peach-600 truncate cursor-pointer"
            >
              Atipic Doces
            </Link>
            <Link
              href="/quem-somos"
              className="group inline-flex items-center gap-0.5 w-fit -mt-0.5 pl-2 pr-1.5 py-0.5 rounded-full bg-mint-50 hover:bg-mint-100 text-[11px] sm:text-xs font-medium text-mint-700 transition cursor-pointer"
            >
              quem somos
              <IconChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <button
          onClick={onOpenCart}
          className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 hover:opacity-75 active:scale-90 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 rounded-full"
          aria-label="Abrir carrinho"
        >
          <img src="/cart-icon.png" alt="Carrinho" className="w-7 h-7 sm:w-9 sm:h-9 object-contain" />
          {totalItems > 0 && (
            <span
              key={totalItems}
              className="absolute -top-1 -right-1 bg-peach-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-[pop-in_300ms_ease-out] tabular-nums"
            >
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {showCategories && categories.length > 0 && (
        <nav className="max-w-5xl mx-auto px-3 sm:px-4 pb-2.5 sm:pb-3 flex gap-2 sm:gap-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory?.(category)}
              className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 ${
                activeCategory === category
                  ? "bg-peach-500 text-white"
                  : "bg-mint-50 text-mint-700 hover:bg-mint-100"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
