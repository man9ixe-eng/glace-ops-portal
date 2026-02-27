import { NextResponse } from "next/server";
import { getPublicBaseUrl } from "@/lib/publicUrl";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const base = getPublicBaseUrl(req);
  const cookie = req.headers.get("cookie") || "";

  // Use incoming cookies to ask NextAuth who you are
  const r = await fetch(`${base}/api/auth/session`, {
    headers: { cookie },
    cache: "no-store",
  });

  const data = await r.json().catch(() => null);

  return NextResponse.json({
    ok: true,
    hasCookieHeader: cookie.length > 0,
    sessionUser: data?.user || null,
    nextauthUrl: process.env.NEXTAUTH_URL || null,
    hasRobloxClientId: !!process.env.ROBLOX_CLIENT_ID,
  });
}
