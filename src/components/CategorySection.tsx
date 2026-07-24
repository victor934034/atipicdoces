"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { IconChevronRight } from "@/components/icons";
import { useDragScroll } from "@/hooks/useDragScroll";

type CategorySectionProps = {
  categoryName: string;
  slug: string;
  products: Product[];
  onOpenProduct: (product: Product) => void;
  maxVisible?: number;
};

export const CategorySection = forwardRef<HTMLElement, CategorySectionProps>(
  function CategorySection(
    { categoryName, slug, products, onOpenProduct, maxVisible = 8 },
    ref
  ) {
    const visibleProducts = products.slice(0, maxVisible);
    const hasMore = products.length > maxVisible;
    const showSeeMore = hasMore || products.length > 3;
    const { ref: scrollRef, isDragging, handlers } = useDragScroll<HTMLDivElement>();

    return (
      <section
        ref={ref}
        id={slug}
        data-category-name={categoryName}
        className="scroll-mt-[150px] py-5"
      >
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{categoryName}</h2>
          {showSeeMore && (
            <Link
              href={`/categoria/${slug}`}
              className="flex items-center gap-0.5 text-sm font-medium text-peach-600 hover:text-peach-700 transition cursor-pointer shrink-0"
            >
              Ver tudo
              <IconChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div
          ref={scrollRef}
          {...handlers}
          className={`max-w-5xl mx-auto px-4 flex gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar pb-1 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {visibleProducts.map((product) => (
            <div key={product.id} className="w-[132px] sm:w-[210px] shrink-0">
              <ProductCard product={product} onOpen={onOpenProduct} />
            </div>
          ))}

          {showSeeMore && (
            <Link
              href={`/categoria/${slug}`}
              className="group w-[132px] sm:w-[210px] shrink-0 rounded-2xl border-2 border-dashed border-mint-200 hover:border-mint-400 bg-mint-50/40 hover:bg-mint-50 transition-colors flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-mint-700 cursor-pointer"
            >
              <span className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <IconChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span className="text-xs sm:text-sm font-medium">Ver mais</span>
            </Link>
          )}
        </div>
      </section>
    );
  }
);
