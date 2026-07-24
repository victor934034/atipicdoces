import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.json({ username: session.username });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { currentPassword, newUsername, newPassword } = await request.json();

  if (!currentPassword) {
    return NextResponse.json({ error: "Informe a senha atual" }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { username: session.username } });
  if (!admin) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });
  }

  const trimmedUsername = newUsername?.trim();
  const wantsUsernameChange = trimmedUsername && trimmedUsername !== admin.username;
  const wantsPasswordChange = Boolean(newPassword);

  if (!wantsUsernameChange && !wantsPasswordChange) {
    return NextResponse.json(
      { error: "Informe um novo usuário ou uma nova senha" },
      { status: 400 }
    );
  }

  if (wantsPasswordChange && newPassword.length < 6) {
    return NextResponse.json(
      { error: "A nova senha deve ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  if (wantsUsernameChange) {
    const existing = await prisma.adminUser.findUnique({ where: { username: trimmedUsername } });
    if (existing) {
      return NextResponse.json({ error: "Esse nome de usuário já está em uso" }, { status: 409 });
    }
  }

  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      ...(wantsUsernameChange && { username: trimmedUsername }),
      ...(wantsPasswordChange && { passwordHash: await bcrypt.hash(newPassword, 10) }),
    },
  });

  await createSession(updated.username);

  return NextResponse.json({ username: updated.username });
}
