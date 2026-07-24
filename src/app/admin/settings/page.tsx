"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export default function AdminSettingsPage() {
  const router = useRouter();

  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setWhatsappNumber(data.whatsappNumber ?? "");
        setLoading(false);
      });
    fetch("/api/admin/account")
      .then((res) => res.json())
      .then((data) => setCurrentUsername(data.username ?? ""));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao salvar");
      return;
    }

    const data = await res.json();
    setWhatsappNumber(data.whatsappNumber);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAccountError(null);
    setAccountSaved(false);

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError("As senhas novas não coincidem");
      return;
    }

    if (!newUsername.trim() && !newPassword) {
      setAccountError("Preencha um novo usuário ou uma nova senha");
      return;
    }

    setSavingAccount(true);

    const res = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword || undefined,
      }),
    });

    setSavingAccount(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAccountError(data.error ?? "Erro ao atualizar conta");
      return;
    }

    const data = await res.json();
    setCurrentUsername(data.username);
    setCurrentPassword("");
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setAccountSaved(true);
    setTimeout(() => setAccountSaved(false), 3000);
    router.refresh();
  }

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8 text-mint-500" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-lg animate-[fade-in_250ms_ease-out]">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Configurações</h1>
        <p className="text-sm text-gray-500">
          Número de WhatsApp para onde os pedidos serão redirecionados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do WhatsApp
          </label>
          <input
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="Ex: 5511999999999"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Só números, com código do país (55) e DDD. Ex: 5511999999999
          </p>
        </div>

        {error && <p className="text-sm text-red-600 animate-[fade-in_200ms_ease-out]">{error}</p>}
        {saved && (
          <p className="text-sm text-mint-700 animate-[pop-in_250ms_ease-out]">
            Salvo com sucesso!
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-peach-500 text-white font-medium px-6 py-2 hover:bg-peach-600 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-600 focus-visible:ring-offset-2"
        >
          <span className="inline-flex items-center gap-2">
            {saving && <Spinner className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar"}
          </span>
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-gray-800">Minha conta</h2>
        <p className="text-sm text-gray-500">
          Usuário atual: <span className="font-medium text-gray-700">{currentUsername}</span>
        </p>
      </div>

      <form
        onSubmit={handleAccountSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha atual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Confirme sua senha atual para alterar"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Novo usuário <span className="text-xs text-gray-400">opcional</span>
          </label>
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder={currentUsername}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nova senha <span className="text-xs text-gray-400">opcional</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-mint-500"
            />
          </div>
        </div>

        {accountError && (
          <p className="text-sm text-red-600 animate-[fade-in_200ms_ease-out]">{accountError}</p>
        )}
        {accountSaved && (
          <p className="text-sm text-mint-700 animate-[pop-in_250ms_ease-out]">
            Conta atualizada com sucesso!
          </p>
        )}

        <button
          type="submit"
          disabled={savingAccount}
          className="rounded-full bg-peach-500 text-white font-medium px-6 py-2 hover:bg-peach-600 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-600 focus-visible:ring-offset-2"
        >
          <span className="inline-flex items-center gap-2">
            {savingAccount && <Spinner className="w-4 h-4" />}
            {savingAccount ? "Salvando..." : "Atualizar conta"}
          </span>
        </button>
      </form>
    </div>
  );
}
