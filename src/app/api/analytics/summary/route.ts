import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TIME_ZONE = "America/Sao_Paulo";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function saoPauloDateKey(date: Date): string {
  return dateKeyFormatter.format(date);
}

function startOfSaoPauloDay(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00-03:00`);
}

function addDaysToKey(dateKey: string, delta: number): string {
  const d = startOfSaoPauloDay(dateKey);
  d.setUTCDate(d.getUTCDate() + delta);
  return saoPauloDateKey(d);
}

export async function GET(request: NextRequest) {
  const days = Math.max(1, Number(request.nextUrl.searchParams.get("days") ?? "30"));

  const todayKey = saoPauloDateKey(new Date());
  const sinceKey = addDaysToKey(todayKey, -(days - 1));
  const since = startOfSaoPauloDay(sinceKey);

  const [visits, clicks, events] = await Promise.all([
    prisma.analyticsEvent.count({ where: { type: "visit", createdAt: { gte: since } } }),
    prisma.analyticsEvent.count({ where: { type: "checkout_click", createdAt: { gte: since } } }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: { type: true, createdAt: true },
    }),
  ]);

  const conversionRate = visits > 0 ? clicks / visits : 0;

  const byDay = new Map<string, { visits: number; clicks: number }>();
  let cursor = sinceKey;
  for (let i = 0; i < days; i++) {
    byDay.set(cursor, { visits: 0, clicks: 0 });
    cursor = addDaysToKey(cursor, 1);
  }

  for (const event of events) {
    const key = saoPauloDateKey(new Date(event.createdAt));
    const entry = byDay.get(key);
    if (!entry) continue;
    if (event.type === "visit") entry.visits += 1;
    if (event.type === "checkout_click") entry.clicks += 1;
  }

  const daily = Array.from(byDay.entries()).map(([date, counts]) => ({ date, ...counts }));
  const today = byDay.get(todayKey) ?? { visits: 0, clicks: 0 };

  return NextResponse.json({
    days,
    visits,
    clicks,
    conversionRate,
    today,
    daily,
    generatedAt: new Date().toISOString(),
  });
}
