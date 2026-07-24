"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { IconCake } from "@/components/icons";
import { Spinner } from "@/components/Spinner";
import { Dropdown } from "@/components/Dropdown";

type Category = { id: string; name: string; order: number };

type ProductFormProps = {
  initial?: Partial<Product>;
  productId?: string;
};

export function ProductForm({ initial, productId }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String((initial.price ?? 0) / 100) : "");
  const [cost, setCost] = useState(
    initial?.cost != null ? String(initial.cost / 100) : ""
  );
  const [category, setCategory] = useState(initial?.category ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (!category && data.length > 0) {
          setCategory(data[0].name);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao enviar imagem");
      return;
    }

    const data = await res.json();
    setPhotoUrl(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceCents = Math.round(parseFloat(price.replace(",", ".")) * 100);
    if (isNaN(priceCents)) {
      setError("Preço inválido");
      return;
    }
    const costCents = cost.trim()
      ? Math.round(parseFloat(cost.replace(",", ".")) * 100)
      : null;

    setSaving(true);

    const body = {
      title,
      description,
      price: priceCents,
      cost: costCents,
      category,
      photoUrl: photoUrl.trim() || null,
      active,
    };

    const res = await fetch(
      productId ? `/api/products/${productId}` : "/api/products",
      {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar produto");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Foto do produto</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl bg-mint-50 border border-mint-200 overflow-hidden flex items-center justify-center shrink-0 transition-all duration-200">
            {uploading ? (
              <Spinner className="w-6 h-6 text-mint-400" />
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt="Prévia"
                className="w-full h-full object-cover animate-[fade-in_200ms_ease-out]"
              />
            ) : (
              <IconCake className="w-8 h-8 text-mint-300" />
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-mint-500 text-mint-700 px-4 py-1.5 text-sm font-medium hover:bg-mint-50 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
            >
              {uploading ? "Enviando..." : photoUrl ? "Trocar foto" : "Enviar foto"}
            </button>
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                className="block text-xs text-red-500 hover:underline cursor-pointer"
              >
                Remover foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            placeholder="Ex: 15.90"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custo (R$) <span className="text-xs text-gray-400">opcional</span>
          </label>
          <input
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            placeholder="Ex: 5.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        {categories.length > 0 ? (
          <Dropdown
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            value={category}
            onChange={setCategory}
            className="block w-full"
            buttonClassName="w-full"
          />
        ) : (
          <p className="text-sm text-gray-500">
            Nenhuma categoria cadastrada ainda. Crie uma em{" "}
            <a href="/admin/categories" className="text-peach-600 underline">
              Categorias
            </a>
            .
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="cursor-pointer"
        />
        Produto ativo (visível no site)
      </label>

      {error && <p className="text-sm text-red-600 animate-[fade-in_200ms_ease-out]">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-full bg-peach-500 text-white font-medium px-6 py-2 hover:bg-peach-600 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-600 focus-visible:ring-offset-2"
      >
        <span className="inline-flex items-center gap-2">
          {saving && <Spinner className="w-4 h-4" />}
          {saving ? "Salvando..." : "Salvar"}
        </span>
      </button>
    </form>
  );
}
