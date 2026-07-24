import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  const products = await prisma.product.findMany({
    where: session ? {} : { active: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  if (!session) {
    const publicProducts = products.map(({ cost: _cost, ...rest }) => rest);
    return NextResponse.json(publicProducts);
  }

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const { title, description, price, cost, category, photoUrl, active, order } = data;

  if (!title || !description || price == null || !category) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      cost: cost ?? null,
      category,
      photoUrl: photoUrl ?? null,
      active: active ?? true,
      order: order ?? 0,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
