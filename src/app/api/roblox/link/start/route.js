import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function sha256Base64Url(input) {
  const hash = crypto.createHash("sha256").update(input).digest();
  return base64url(hash);
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("callbackUrl", "/sign-in");
    return NextResponse.redirect(url);
  }

  const clientId = process.env.ROBLOX_CLIENT_ID;
  const baseUrl  = process.env.NEXTAUTH_URL;
  if (!clientId || !baseUrl) {
    return NextResponse.json({ ok: false, error: "Missing ROBLOX_CLIENT_ID or NEXTAUTH_URL" }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/roblox/link/callback`;

  // PKCE
  const verifier  = base64url(crypto.randomBytes(48));
  const challenge = sha256Base64Url(verifier);

  // state
  const state = base64url(crypto.randomBytes(16));

  const authUrl = new URL("https://apis.roblox.com/oauth/v1/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "openid profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const res = NextResponse.redirect(authUrl);

  // store verifier/state short-lived
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  };

  res.cookies.set("roblox_pkce_verifier", verifier, cookieOpts);
  res.cookies.set("roblox_oauth_state", state, cookieOpts);

  return res;
}