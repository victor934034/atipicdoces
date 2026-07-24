"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductModal } from "@/components/ProductModal";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { CategorySection } from "@/components/CategorySection";
import { Product } from "@/lib/types";
import { IconCake } from "@/components/icons";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string; order: number };

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [cartOpen, setCartOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollingToSection = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/settings", { cache: "no-store" }).then((res) => res.json()),
    ]).then(([productsData, categoriesData, settingsData]: [Product[], Category[], { whatsappNumber: string }]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setWhatsappNumber(settingsData.whatsappNumber ?? "");
      const firstWithProducts = categoriesData.find((c) =>
        productsData.some((p) => p.category === c.name)
      );
      setActiveCategory(firstWithProducts?.name ?? productsData[0]?.category ?? "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  const categoriesWithProducts = useMemo(() => {
    const withProducts = categories.filter((c) =>
      products.some((p) => p.category === c.name)
    );
    if (withProducts.length > 0) return withProducts;
    const names = Array.from(new Set(products.map((p) => p.category)));
    return names.map((name, i) => ({ id: name, name, order: i }));
  }, [categories, products]);

  const categoryNames = useMemo(
    () => categoriesWithProducts.map((c) => c.name),
    [categoriesWithProducts]
  );

  // Scrollspy: highlight the tab for whichever section is currently most
  // visible, so the header stays in sync as the person scrolls the feed.
  useEffect(() => {
    if (categoriesWithProducts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToSection.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const name = (visible[0].target as HTMLElement).dataset.categoryName;
          if (name) setActiveCategory(name);
        }
      },
      { rootMargin: "-160px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const el of sectionRefs.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [categoriesWithProducts]);

  function handleSelectCategory(name: string) {
    setActiveCategory(name);
    const slug = slugify(name);
    const el = sectionRefs.current.get(slug);
    if (!el) return;

    scrollingToSection.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      scrollingToSection.current = false;
    }, 700);
  }

  return (
    <>
      <Header
        categories={categoryNames}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenCart={() => setCartOpen(true)}
      />

      <section className="bg-gradient-to-b from-peach-50 to-transparent">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-4 text-center animate-[fade-in_400ms_ease-out]">
          <p className="font-brand text-4xl sm:text-5xl text-peach-600 leading-tight">
            Doces feitos com carinho
          </p>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Monte seu pedido e finalize direto pelo WhatsApp
          </p>
        </div>
      </section>

      <main className="flex-1 w-full py-2">
        {loading ? (
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : categoriesWithProducts.length === 0 ? (
          <p className="text-center text-gray-500 mt-12 animate-[fade-in_250ms_ease-out]">
            Nenhum produto disponível no momento.
          </p>
        ) : (
          categoriesWithProducts.map((category) => {
            const slug = slugify(category.name);
            return (
              <CategorySection
                key={category.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(slug, el);
                  else sectionRefs.current.delete(slug);
                }}
                categoryName={category.name}
                slug={slug}
                products={products.filter((p) => p.category === category.name)}
                onOpenProduct={setSelectedProduct}
              />
            );
          })
        )}
      </main>

      <footer className="flex flex-col items-center justify-center gap-1.5 text-xs text-gray-400 py-6">
        <span className="flex items-center gap-1.5">
          <IconCake className="w-3.5 h-3.5" />
          Atipic Doces — feito com carinho
        </span>
        <Link href="/quem-somos" className="text-mint-600 hover:text-mint-700 transition cursor-pointer">
          Quem somos
        </Link>
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        whatsappNumber={whatsappNumber}
      />

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  );
}
