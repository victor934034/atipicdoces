"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductModal } from "@/components/ProductModal";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Product } from "@/lib/types";
import { IconArrowLeft, IconCake } from "@/components/icons";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string; order: number };

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
      fetch("/api/settings", { cache: "no-store" }).then((res) => res.json()),
    ]).then(([productsData, categoriesData, settingsData]: [Product[], Category[], { whatsappNumber: string }]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setWhatsappNumber(settingsData.whatsappNumber ?? "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  const category = useMemo(
    () => categories.find((c) => slugify(c.name) === params.slug),
    [categories, params.slug]
  );

  const categoryNames = useMemo(() => {
    const withProducts = categories
      .map((c) => c.name)
      .filter((name) => products.some((p) => p.category === name));
    if (withProducts.length > 0) return withProducts;
    return Array.from(new Set(products.map((p) => p.category)));
  }, [categories, products]);

  const categoryProducts = category
    ? products.filter((p) => p.category === category.name)
    : [];

  function handleSelectCategory(name: string) {
    router.push(`/categoria/${slugify(name)}`);
  }

  return (
    <>
      <Header
        categories={categoryNames}
        activeCategory={category?.name ?? ""}
        onSelectCategory={handleSelectCategory}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-peach-600 transition cursor-pointer mb-4"
        >
          <IconArrowLeft className="w-4 h-4" />
          Voltar ao cardápio
        </Link>

        {loading ? (
          <>
            <div className="h-8 w-48 bg-gray-100 rounded-full animate-pulse mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : !category ? (
          <p className="text-center text-gray-500 mt-12">Categoria não encontrada.</p>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-5 animate-[fade-in_250ms_ease-out]">
              {category.name}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />
              ))}
            </div>

            {categoryProducts.length === 0 && (
              <p className="text-center text-gray-500 mt-12">
                Nenhum produto nessa categoria ainda.
              </p>
            )}
          </>
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
