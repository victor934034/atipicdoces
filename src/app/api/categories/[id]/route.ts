import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, order } = await request.json();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  if (name !== undefined && name.trim() && name.trim() !== category.name) {
    const conflict = await prisma.category.findUnique({ where: { name: name.trim() } });
    if (conflict) {
      return NextResponse.json({ error: "Já existe uma categoria com esse nome" }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { category: category.name },
        data: { category: name.trim() },
      }),
      prisma.category.update({ where: { id }, data: { name: name.trim() } }),
    ]);
  }

  if (order !== undefined) {
    await prisma.category.update({ where: { id }, data: { order } });
  }

  const updated = await prisma.category.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
  }

  const productCount = await prisma.product.count({ where: { category: category.name } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Existem ${productCount} produto(s) nessa categoria. Mova ou remova-os antes.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
