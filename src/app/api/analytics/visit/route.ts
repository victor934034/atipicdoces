import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  await prisma.analyticsEvent.create({ data: { type: "visit" } });
  return NextResponse.json({ success: true });
}
