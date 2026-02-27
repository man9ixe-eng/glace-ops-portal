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

function getSessionToken(req) {
  return (
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value ||
    null
  );
}

export async function GET(req) {
  const base = getPublicBaseUrl(req);
  const url = new URL(req.url);
  const callbackUrl = url.searchParams.get("callbackUrl") || "/sign-in";

  const sessionToken = getSessionToken(req);

  // must be signed in (Discord) before linking Roblox
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

  // Roblox rejects profile:read; use openid + profile
  auth.searchParams.set("scope", "openid profile");

  auth.searchParams.set("state", state);
  auth.searchParams.set("code_challenge", codeChallenge);
  auth.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(auth.toString(), 307);

  // temp cookies
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
