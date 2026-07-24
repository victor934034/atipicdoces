"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconChevronUp, IconClose, IconPlus, IconTrash } from "@/components/icons";
import { Spinner } from "@/components/Spinner";

type Category = { id: string; name: string; order: number; productCount: number };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    setSaving(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao criar categoria");
      return;
    }

    setNewName("");
    load();
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingValue(category.name);
    setEditError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingValue("");
    setEditError(null);
  }

  async function saveEditing(category: Category) {
    const name = editingValue.trim();
    if (!name || name === category.name) {
      cancelEditing();
      return;
    }

    const res = await fetch(`/api/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error ?? "Erro ao renomear categoria");
      return;
    }

    cancelEditing();
    load();
  }

  async function handleDelete(category: Category) {
    if (category.productCount > 0) {
      alert(
        `Essa categoria tem ${category.productCount} produto(s). Mova ou remova-os antes de excluir a categoria.`
      );
      return;
    }
    if (!confirm(`Remover a categoria "${category.name}"?`)) return;

    const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Erro ao remover categoria");
      return;
    }

    load();
  }

  async function handleMove(category: Category, direction: -1 | 1) {
    const index = categories.findIndex((c) => c.id === category.id);
    const swapWith = categories[index + direction];
    if (!swapWith) return;

    await Promise.all([
      fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: swapWith.order }),
      }),
      fetch(`/api/categories/${swapWith.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: category.order }),
      }),
    ]);

    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Categorias</h1>
        <p className="text-sm text-gray-500">
          Organize as abas do cardápio. A ordem aqui define a ordem exibida no site.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
        />
        <button
          type="submit"
          disabled={saving || !newName.trim()}
          className="flex items-center gap-1.5 rounded-full bg-peach-500 text-white font-medium px-5 py-2 hover:bg-peach-600 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-600 focus-visible:ring-offset-2"
        >
          <IconPlus className="w-4 h-4" />
          Adicionar
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-7 h-7 text-mint-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 max-w-lg animate-[fade-in_250ms_ease-out]">
          {categories.map((category, index) => (
            <div key={category.id} className="p-4 animate-[fade-in_200ms_ease-out]">
              <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                {editingId === category.id ? (
                  <div className="flex-1 min-w-[180px] flex items-center gap-2">
                    <input
                      ref={editInputRef}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditing(category);
                        if (e.key === "Escape") cancelEditing();
                      }}
                      className="flex-1 rounded-lg border border-mint-400 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
                    />
                    <button
                      onClick={() => saveEditing(category)}
                      className="text-sm px-3 py-1.5 rounded-full bg-mint-500 text-white cursor-pointer hover:bg-mint-600 active:scale-95 transition"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEditing}
                      aria-label="Cancelar edição"
                      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 active:scale-90 cursor-pointer transition"
                    >
                      <IconClose className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing(category)}
                    className="flex-1 min-w-[140px] flex items-center gap-2 flex-wrap text-left cursor-pointer group"
                  >
                    <span className="font-medium text-gray-800 group-hover:text-peach-600 transition truncate max-w-[180px]">
                      {category.name}
                    </span>
                    <span className="shrink-0 text-xs bg-mint-50 text-mint-700 px-2 py-0.5 rounded-full">
                      {category.productCount} produto{category.productCount === 1 ? "" : "s"}
                    </span>
                  </button>
                )}

                {editingId !== category.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(category, -1)}
                      disabled={index === 0}
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-50 active:scale-90 disabled:active:scale-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      aria-label="Mover para cima"
                    >
                      <IconChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(category, 1)}
                      disabled={index === categories.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:bg-gray-50 active:scale-90 disabled:active:scale-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      aria-label="Mover para baixo"
                    >
                      <IconChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      aria-label="Remover categoria"
                      title="Remover"
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-red-300 text-red-600 hover:bg-red-50 active:scale-90 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {editingId === category.id && editError && (
                <p className="text-xs text-red-600 mt-1.5">{editError}</p>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <p className="p-8 text-gray-500 text-center">Nenhuma categoria cadastrada ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}
