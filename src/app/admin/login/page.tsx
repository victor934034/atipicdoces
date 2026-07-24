"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao fazer login");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-mint-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 space-y-4 animate-[card-in_300ms_ease-out]"
      >
        <h1 className="text-2xl font-brand text-center text-peach-600">
          Atipic Doces
        </h1>
        <p className="text-center text-sm text-gray-500">Painel administrativo</p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600 animate-[fade-in_200ms_ease-out]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-peach-500 text-white font-medium py-2 hover:bg-peach-600 active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-600 focus-visible:ring-offset-2"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {loading && <Spinner className="w-4 h-4" />}
            {loading ? "Entrando..." : "Entrar"}
          </span>
        </button>
      </form>
    </div>
  );
}
