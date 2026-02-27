import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function tokenExchange({ code, verifier, redirectUri }) {
  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", redirectUri);
  body.set("client_id", process.env.ROBLOX_CLIENT_ID);
  body.set("client_secret", process.env.ROBLOX_CLIENT_SECRET);
  body.set("code_verifier", verifier);

  const r = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = await r.json();
  if (!r.ok) {
    throw new Error(`Roblox token error: ${r.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function fetchUserInfo(accessToken) {
  const r = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await r.json();
  if (!r.ok) {
    throw new Error(`Roblox userinfo error: ${r.status} ${JSON.stringify(json)}`);
  }
  return json;
}

export async function GET(req) {
  const url = new URL(req.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // must be logged in with Discord already
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/sign-in?error=NotSignedIn", req.url));
  }

  const cookieState = req.cookies.get("roblox_oauth_state")?.value;
  const verifier = req.cookies.get("roblox_pkce_verifier")?.value;

  // clear cookies regardless
  const clearCookies = (res) => {
    res.cookies.set("roblox_oauth_state", "", { path: "/", maxAge: 0 });
    res.cookies.set("roblox_pkce_verifier", "", { path: "/", maxAge: 0 });
    return res;
  };

  if (!code || !state || !cookieState || !verifier || state !== cookieState) {
    return clearCookies(NextResponse.redirect(new URL("/sign-in?error=RobloxState", req.url)));
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL;
    const redirectUri = `${baseUrl}/api/roblox/link/callback`;

    const token = await tokenExchange({ code, verifier, redirectUri });
    const info = await fetchUserInfo(token.access_token);

    const robloxUserId = info?.sub ? String(info.sub) : null;
    if (!robloxUserId) {
      throw new Error("Roblox userinfo missing sub");
    }

    // If this Roblox is already linked to another user, block it.
    const existing = await prisma.account.findFirst({
      where: { provider: "roblox", providerAccountId: robloxUserId },
      select: { id: true, userId: true },
    });

    if (existing && existing.userId !== session.user.id) {
      return clearCookies(NextResponse.redirect(new URL("/sign-in?error=RobloxAlreadyLinked", req.url)));
    }

    // Create link if missing (do not overwrite Discord session)
    if (!existing) {
      await prisma.account.create({
        data: {
          userId: session.user.id,
          type: "oauth",
          provider: "roblox",
          providerAccountId: robloxUserId,
          access_token: token.access_token ?? null,
          refresh_token: token.refresh_token ?? null,
          expires_at: token.expires_in ? Math.floor(Date.now() / 1000) + Number(token.expires_in) : null,
          token_type: token.token_type ?? null,
          scope: token.scope ?? null,
          id_token: token.id_token ?? null,
        },
      });
    }

    return clearCookies(NextResponse.redirect(new URL("/sign-in?linked=roblox", req.url)));
  } catch (e) {
    console.error("[ROBLOX LINK CALLBACK]", e);
    return clearCookies(NextResponse.redirect(new URL("/sign-in?error=RobloxCallback", req.url)));
  }
}