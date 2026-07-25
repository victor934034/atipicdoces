import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getUploadsDir, CONTENT_TYPE_BY_EXTENSION } from "@/lib/uploads";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Only allow the exact "<uuid>.<ext>" shape we generate on upload — this
  // also blocks path traversal (no slashes, no "..").
  if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }

  const extension = filename.split(".").pop()!.toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXTENSION[extension];

  try {
    const filePath = path.join(getUploadsDir(), filename);
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }
}
