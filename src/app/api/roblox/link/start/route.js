import { NextResponse } from "next/server";
import crypto from "crypto";
import { getPublicBaseUrl } from "@/lib/publicUrl";

export const dynamic = "force-dynamic";

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest();
}

async function getAuthSession(req, base) {
  const cookie = req.headers.get("cookie") || "";
  const r = await fetch(`${base}/api/auth/session`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const data = await r.json().catch(() => null);
  // When not logged in, NextAuth returns {} or { user: undefined }
  if (!data?.user?.id) return null;
  return data;
}

export async function GET(req) {
  const base = getPublicBaseUrl(req);
  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/sign-in";

  // ✅ Reliable "am I logged in with Discord?" check
  const session = await getAuthSession(req, base);
  if (!session) {
    return NextResponse.redirect(`${base}/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`, 307);
  }

  const clientId = process.env.ROBLOX_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${base}/sign-in?error=MissingRobloxClientId`, 307);
  }

  const codeVerifier = b64url(crypto.randomBytes(32));
  const codeChallenge = b64url(sha256(codeVerifier));
  const state = b64url(crypto.randomBytes(24));

  const redirectUri = `${base}/api/roblox/link/callback`;

  const auth = new URL("https://apis.roblox.com/oauth/v1/authorize");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("scope", "openid profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", codeChallenge);
  auth.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(auth.toString(), 307);

  res.cookies.set("gh_rbx_state", state, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 10 * 60,
  });
  res.cookies.set("gh_rbx_verifier", codeVerifier, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 10 * 60,
  });
  res.cookies.set("gh_rbx_cb", callbackUrl, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 10 * 60,
  });

  return res;
}
