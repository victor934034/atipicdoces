"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import {
  IconCake,
  IconPause,
  IconPencil,
  IconPlay,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@/components/icons";
import { Spinner } from "@/components/Spinner";
import { Dropdown } from "@/components/Dropdown";

type Category = { id: string; name: string; order: number; productCount: number };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ]);
    setProducts(await productsRes.json());
    setCategories(await categoriesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(product: Product) {
    const nextActive = !product.active;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: nextActive } : p))
    );

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: nextActive }),
    });

    if (!res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: product.active } : p))
      );
      alert("Não foi possível atualizar o produto. Tente novamente.");
    }
  }

  async function remove(product: Product) {
    if (!confirm(`Remover "${product.title}"? Esta ação não pode ser desfeita.`)) return;

    setRemovingIds((prev) => new Set(prev).add(product.id));

    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });

    if (!res.ok) {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      alert("Não foi possível remover o produto. Tente novamente.");
      return;
    }

    setTimeout(() => {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 200);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-500">{products.length} produto(s) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-full bg-peach-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-peach-600 active:scale-95 transition shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-600 focus-visible:ring-offset-2"
        >
          <IconPlus className="w-4 h-4" />
          Novo produto
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm bg-white transition focus:outline-none focus:ring-2 focus:ring-mint-500"
          />
        </div>
        <Dropdown
          options={[
            { value: "all", label: "Todas as categorias" },
            ...categories.map((c) => ({ value: c.name, label: c.name })),
          ]}
          value={categoryFilter}
          onChange={setCategoryFilter}
          buttonClassName="min-w-[180px]"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8 text-mint-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all duration-200 ease-out ${
                  removingIds.has(product.id)
                    ? "opacity-0 scale-95"
                    : "opacity-100 scale-100 animate-[card-in_250ms_ease-out]"
                }`}
              >
                <div className="relative w-full aspect-video bg-mint-50 overflow-hidden">
                  {product.photoUrl ? (
                    <img
                      src={product.photoUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconCake className="w-8 h-8 text-mint-300" />
                    </div>
                  )}
                  <span
                    className={`absolute top-2 left-2 text-xs bg-gray-800/80 text-white px-2 py-0.5 rounded-full transition-all duration-200 ${
                      product.active
                        ? "opacity-0 -translate-y-1 pointer-events-none"
                        : "opacity-100 translate-y-0"
                    }`}
                  >
                    Pausado
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-800 truncate">{product.title}</p>
                    <span className="font-semibold text-peach-600 shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <span className="inline-block w-fit bg-mint-50 text-mint-700 px-2 py-0.5 rounded-full text-xs">
                    {product.category}
                  </span>

                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <button
                      onClick={() => toggleActive(product)}
                      aria-label={product.active ? "Pausar produto" : "Ativar produto"}
                      title={product.active ? "Pausar" : "Ativar"}
                      className="relative w-8 h-8 flex items-center justify-center rounded-full border border-mint-500 text-mint-700 hover:bg-mint-50 active:scale-90 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 overflow-hidden"
                    >
                      <IconPause
                        className={`w-4 h-4 absolute transition-all duration-150 ${
                          product.active
                            ? "opacity-100 scale-100 rotate-0"
                            : "opacity-0 scale-50 rotate-90"
                        }`}
                      />
                      <IconPlay
                        className={`w-4 h-4 absolute transition-all duration-150 ${
                          !product.active
                            ? "opacity-100 scale-100 rotate-0"
                            : "opacity-0 scale-50 -rotate-90"
                        }`}
                      />
                    </button>
                    <Link
                      href={`/admin/products/${product.id}`}
                      aria-label="Editar produto"
                      title="Editar"
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 active:scale-90 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                    >
                      <IconPencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => remove(product)}
                      aria-label="Remover produto"
                      title="Remover"
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-red-300 text-red-600 hover:bg-red-50 active:scale-90 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ml-auto"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="p-8 text-gray-500 text-center bg-white rounded-2xl shadow-sm">
              {products.length === 0
                ? "Nenhum produto cadastrado ainda."
                : "Nenhum produto encontrado com esses filtros."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
