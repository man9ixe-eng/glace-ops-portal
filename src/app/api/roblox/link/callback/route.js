import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/publicUrl";

export const dynamic = "force-dynamic";

async function getAuthSession(req, base) {
  const cookie = req.headers.get("cookie") || "";
  const r = await fetch(`${base}/api/auth/session`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!r.ok) return null;
  const data = await r.json().catch(() => null);
  if (!data?.user?.id) return null;
  return data;
}

export async function GET(req) {
  const base = getPublicBaseUrl(req);
  const url = new URL(req.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieState = req.cookies.get("gh_rbx_state")?.value || null;
  const verifier = req.cookies.get("gh_rbx_verifier")?.value || null;
  const cb = req.cookies.get("gh_rbx_cb")?.value || "/sign-in";

  const session = await getAuthSession(req, base);
  if (!session) {
    return NextResponse.redirect(`${base}/sign-in?callbackUrl=${encodeURIComponent(cb)}`, 307);
  }

  if (!code || !state || !cookieState || state !== cookieState || !verifier) {
    return NextResponse.redirect(`${base}/sign-in?error=RobloxStateMismatch`, 307);
  }

  const clientId = process.env.ROBLOX_CLIENT_ID;
  const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${base}/sign-in?error=MissingRobloxEnv`, 307);
  }

  const redirectUri = `${base}/api/roblox/link/callback`;

  const tokenRes = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${base}/sign-in?error=RobloxTokenExchange`, 307);
  }

  const tokenJson = await tokenRes.json();
  const accessToken = tokenJson.access_token;

  const uiRes = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!uiRes.ok) {
    return NextResponse.redirect(`${base}/sign-in?error=RobloxUserinfo`, 307);
  }

  const profile = await uiRes.json();
  const robloxUserId = profile?.sub ? String(profile.sub) : null;
  const robloxName = profile?.name || profile?.preferred_username || null;

  if (!robloxUserId) {
    return NextResponse.redirect(`${base}/sign-in?error=RobloxNoSub`, 307);
  }

  const userId = session.user.id;

  // If Roblox account is already linked to someone else, block
  const existing = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "roblox",
        providerAccountId: robloxUserId,
      },
    },
    select: { userId: true },
  });

  if (existing?.userId && existing.userId !== userId) {
    return NextResponse.redirect(`${base}/sign-in?error=RobloxAlreadyLinked`, 307);
  }

  // Replace current user's roblox link if any
  await prisma.account.deleteMany({
    where: { userId, provider: "roblox" },
  });

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "roblox",
        providerAccountId: robloxUserId,
      },
    },
    update: {
      userId,
      access_token: accessToken,
      scope: tokenJson.scope || null,
      token_type: tokenJson.token_type || null,
      refresh_token: tokenJson.refresh_token || null,
      expires_at: tokenJson.expires_in ? Math.floor(Date.now() / 1000) + Number(tokenJson.expires_in) : null,
    },
    create: {
      userId,
      type: "oauth",
      provider: "roblox",
      providerAccountId: robloxUserId,
      access_token: accessToken,
      scope: tokenJson.scope || null,
      token_type: tokenJson.token_type || null,
      refresh_token: tokenJson.refresh_token || null,
      expires_at: tokenJson.expires_in ? Math.floor(Date.now() / 1000) + Number(tokenJson.expires_in) : null,
    },
  });

  if (robloxName) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: robloxName },
    }).catch(() => {});
  }

  const res = NextResponse.redirect(`${base}${cb}`, 307);
  res.cookies.set("gh_rbx_state", "", { path: "/", maxAge: 0 });
  res.cookies.set("gh_rbx_verifier", "", { path: "/", maxAge: 0 });
  res.cookies.set("gh_rbx_cb", "", { path: "/", maxAge: 0 });

  return res;
}
