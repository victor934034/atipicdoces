"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TrendChart } from "@/components/admin/TrendChart";
import { Spinner } from "@/components/Spinner";
import { Dropdown } from "@/components/Dropdown";

const DAYS_OPTIONS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

type DailyPoint = { date: string; visits: number; clicks: number };

type Summary = {
  days: number;
  visits: number;
  clicks: number;
  conversionRate: number;
  today: { visits: number; clicks: number };
  daily: DailyPoint[];
  generatedAt: string;
};

const POLL_INTERVAL_MS = 5000;

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [days, setDays] = useState(7);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/summary?days=${days}`);
      if (!res.ok) return;
      setSummary(await res.json());
    } catch {
      // silently retry on next poll
    }
  }, [days]);

  useEffect(() => {
    load();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);

    function handleVisibility() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", load);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
            Ao vivo — atualiza a cada 5s
          </p>
        </div>
        <Dropdown
          options={DAYS_OPTIONS}
          value={String(days)}
          onChange={(v) => setDays(Number(v))}
          align="right"
        />
      </div>

      {!summary ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8 text-mint-500" />
        </div>
      ) : (
        <div className="space-y-6 animate-[fade-in_300ms_ease-out]">
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-around text-center">
            <div>
              <p className="text-xs text-gray-500">Visitas hoje</p>
              <p
                key={summary.today.visits}
                className="text-xl font-bold text-mint-700 animate-[pop-in_300ms_ease-out] tabular-nums"
              >
                {summary.today.visits}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <p className="text-xs text-gray-500">Cliques hoje</p>
              <p
                key={summary.today.clicks}
                className="text-xl font-bold text-peach-600 animate-[pop-in_300ms_ease-out] tabular-nums"
              >
                {summary.today.clicks}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Visitas ao site</p>
              <p key={summary.visits} className="text-3xl font-bold text-mint-700 animate-[pop-in_300ms_ease-out] tabular-nums">
                {summary.visits}
              </p>
              <p className="text-xs text-gray-400 mt-1">últimos {summary.days} dias</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Cliques em &quot;Finalizar pedido&quot;</p>
              <p key={summary.clicks} className="text-3xl font-bold text-peach-600 animate-[pop-in_300ms_ease-out] tabular-nums">
                {summary.clicks}
              </p>
              <p className="text-xs text-gray-400 mt-1">últimos {summary.days} dias</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Taxa de conversão</p>
              <p className="text-3xl font-bold text-gray-800 tabular-nums transition-all duration-300">
                {(summary.conversionRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">cliques ÷ visitas</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Visitas x cliques por dia</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-mint-500" /> Visitas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-peach-500" /> Cliques
                </span>
              </div>
            </div>

            <TrendChart data={summary.daily} />
          </div>

          <p className="text-xs text-gray-400 text-right">
            Última atualização: {new Date(summary.generatedAt).toLocaleTimeString("pt-BR")}
          </p>
        </div>
      )}
    </div>
  );
}
