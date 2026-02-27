import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set([
  "/sign-in",
  "/privacy",
  "/terms",
  "/",
  "/favicon.ico",
]);

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/")) return true;        // allow APIs
  if (pathname.startsWith("/_next/")) return true;      // allow Next assets
  return false;
}

function isProtectedPath(pathname) {
  // Add anything you want gated here
  if (pathname.startsWith("/ops")) return true;
  if (pathname.startsWith("/post-ops")) return true;
  return false;
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Let public stuff through
  if (isPublicPath(pathname)) return NextResponse.next();

  // If not protected, let it through
  if (!isProtectedPath(pathname)) return NextResponse.next();

  // Check auth session (JWT cookie works even with DB sessions; it reads the session token)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};