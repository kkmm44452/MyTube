import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*"], // only protect private routes
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const isLoggedIn = !!token;

  const { pathname } = req.nextUrl;

  // 🔐 Block ONLY private routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/upload");

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}