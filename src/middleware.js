import { NextResponse } from "next/server";

// IMPORTANT: let NextAuth + Roblox link endpoints pass through middleware untouched.
export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Always allow NextAuth endpoints
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Always allow Roblox link endpoints
  if (pathname.startsWith("/api/roblox/link")) return NextResponse.next();

  // Always allow debug endpoints
  if (pathname.startsWith("/api/debug")) return NextResponse.next();

  // Allow static / next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js")
  ) {
    return NextResponse.next();
  }

  // Everything else: do nothing here (your page-level auth can handle it)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
