import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.groupBy({ by: ["category"], _count: { category: true } }),
  ]);

  const countByName = new Map(counts.map((c) => [c.category, c._count.category]));

  const result = categories.map((category) => ({
    ...category,
    productCount: countByName.get(category.name) ?? 0,
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Nome da categoria é obrigatório" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name: name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "Categoria já existe" }, { status: 409 });
  }

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name: name.trim(), order: count },
  });

  return NextResponse.json(category, { status: 201 });
}
