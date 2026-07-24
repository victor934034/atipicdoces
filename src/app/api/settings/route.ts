import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getOrCreateSettings() {
  const existing = await prisma.storeSettings.findUnique({ where: { id: "main" } });
  if (existing) return existing;
  return prisma.storeSettings.create({
    data: { id: "main", whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "" },
  });
}

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PATCH(request: NextRequest) {
  const { whatsappNumber } = await request.json();

  const digitsOnly = (whatsappNumber ?? "").replace(/\D/g, "");
  if (!digitsOnly || digitsOnly.length < 10) {
    return NextResponse.json(
      { error: "Número de WhatsApp inválido. Use o formato com DDI e DDD, só números (ex: 5511999999999)." },
      { status: 400 }
    );
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: "main" },
    update: { whatsappNumber: digitsOnly },
    create: { id: "main", whatsappNumber: digitsOnly },
  });

  return NextResponse.json(settings);
}
