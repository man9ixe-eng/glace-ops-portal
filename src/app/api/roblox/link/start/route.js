import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
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

export async function GET(req) {
  const base = getPublicBaseUrl(req);
  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/sign-in";

  // ✅ RELIABLE auth check for App Router route handlers:
  // Check DB session token cookie instead of getServerSession()
  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    null;

  if (!sessionToken) {
    return NextResponse.redirect(`${base}/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`, 307);
  }

  const dbSession = await prisma.session.findUnique({
    where: { sessionToken },
    select: { userId: true },
  });

  if (!dbSession?.userId) {
    return NextResponse.redirect(`${base}/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`, 307);
  }

  const clientId = process.env.ROBLOX_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${base}/sign-in?error=MissingRobloxClientId`, 307);
  }

  // PKCE
  const codeVerifier = b64url(crypto.randomBytes(32));
  const codeChallenge = b64url(sha256(codeVerifier));

  // State
  const state = b64url(crypto.randomBytes(24));

  const redirectUri = `${base}/api/roblox/link/callback`;

  const auth = new URL("https://apis.roblox.com/oauth/v1/authorize");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("redirect_uri", redirectUri);

  // ✅ Roblox scopes (NOT profile:read)
  auth.searchParams.set("scope", "openid profile");

  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", codeChallenge);
  auth.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(auth.toString(), 307);

  // store verifier/state/callbackUrl in cookies
  res.cookies.set("gh_rbx_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  res.cookies.set("gh_rbx_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  res.cookies.set("gh_rbx_cb", callbackUrl, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return res;
}
