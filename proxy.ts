import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, type Role } from "@/lib/constants";

/**
 * Proteksi route (Next.js 16: "middleware" di-rename jadi "proxy").
 * Hanya membaca keberadaan cookie + decode payload JWT (tanpa verifikasi
 * signature) untuk routing; verifikasi signature dilakukan di API route.
 */
function decodeRole(token: string): Role | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const payload = JSON.parse(atob(b64)) as { role?: unknown };
    if (payload.role === "hr" || payload.role === "pelamar") return payload.role;
    return null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const role = token ? decodeRole(token) : null;
  const home = role === "hr" ? "/hr" : "/dashboard";

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profil")) {
    if (!role) return NextResponse.redirect(new URL("/login", request.url));
    if (role === "hr") return NextResponse.redirect(new URL("/hr", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/hr")) {
    if (!role) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "hr") return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname === "/register") {
    if (role) return NextResponse.redirect(new URL(home, request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // /lowongan sengaja publik (pelamar bisa lihat lowongan tanpa login; Lamar butuh login).
  matcher: ["/dashboard/:path*", "/profil/:path*", "/hr/:path*", "/login", "/register"],
};
