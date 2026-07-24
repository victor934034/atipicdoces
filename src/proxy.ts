import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "atipic_admin_session";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedApi =
    (pathname.startsWith("/api/products") && request.method !== "GET") ||
    (pathname.startsWith("/api/categories") && request.method !== "GET") ||
    (pathname.startsWith("/api/settings") && request.method !== "GET") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/analytics/summary") ||
    pathname.startsWith("/api/admin");

  if (!isAdminPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const authenticated = await isAuthenticated(request);

  if (!authenticated) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/settings/:path*",
    "/api/upload/:path*",
    "/api/analytics/:path*",
    "/api/admin/:path*",
  ],
};
