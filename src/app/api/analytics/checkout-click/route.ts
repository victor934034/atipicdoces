import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.analyticsEvent.create({ data: { type: "checkout_click" } });
  return NextResponse.json({ success: true });
}
