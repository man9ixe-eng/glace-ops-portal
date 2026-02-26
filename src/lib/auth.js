import DiscordProvider from "next-auth/providers/discord";

/**
 * Roblox OAuth notes (NextAuth v4):
 * - Roblox returns an `id_token` (OIDC) and may use ES256 signing.
 * - NextAuth v4's built-in OIDC flow can fail with:
 *    - "unexpected JWT alg received, expected RS256, got: ES256"
 *    - "id_token detected... use client.callback() instead of oauthCallback()"
 *
 * Fix approach:
 * - Treat Roblox as generic OAuth
 * - Override token.request to manually exchange the code and STRIP id_token
 * - Then use /userinfo with access_token to get the Roblox user id (sub)
 */

const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oauth",
  version: "2.0",
  checks: ["pkce", "state"],

  authorization: {
    url: "https://apis.roblox.com/oauth/v1/authorize",
    params: {
      scope: "openid profile", // keep for userinfo compatibility, but we strip id_token later
    },
  },

  token: {
    url: "https://apis.roblox.com/oauth/v1/token",
    async request({ params, checks, provider }) {
      const body = new URLSearchParams();
      body.set("grant_type", "authorization_code");
      body.set("code", params.code);
      body.set("redirect_uri", provider.callbackUrl);
      if (checks?.code_verifier) body.set("code_verifier", checks.code_verifier);

      // Roblox supports client secret basic auth
      const basic = Buffer.from(
        `${process.env.ROBLOX_CLIENT_ID}:${process.env.ROBLOX_CLIENT_SECRET}`
      ).toString("base64");

      const res = await fetch("https://apis.roblox.com/oauth/v1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basic}`,
        },
        body: body.toString(),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(`[ROBLOX TOKEN] ${res.status} ${JSON.stringify(json)}`);
      }

      // Critical: remove id_token so NextAuth/OpenID client doesn't try to validate it
      if (json.id_token) delete json.id_token;

      return { tokens: json };
    },
  },

  userinfo: {
    url: "https://apis.roblox.com/oauth/v1/userinfo",
    async request({ tokens }) {
      const res = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await res.json();
      if (!res.ok) {
        throw new Error(`[ROBLOX USERINFO] ${res.status} ${JSON.stringify(profile)}`);
      }
      return profile;
    },
  },

  clientId: process.env.ROBLOX_CLIENT_ID,
  clientSecret: process.env.ROBLOX_CLIENT_SECRET,

  profile(profile) {
    const rid = profile?.sub ? String(profile.sub) : null;
    return {
      id: rid || "roblox",
      name: profile?.name || profile?.preferred_username || "Roblox User",
      robloxUserId: rid,
    };
  },
};

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify" } },
    }),
    RobloxProvider,
  ],

  callbacks: {
    async jwt({ token, profile, account }) {
      // Preserve existing values so linking Roblox doesn't wipe Discord (and vice versa)
      token.discordId = token.discordId ?? null;
      token.robloxUserId = token.robloxUserId ?? null;

      if (account?.provider === "discord") {
        const did = profile?.id ? String(profile.id) : null;
        if (did) token.discordId = did;
      }

      if (account?.provider === "roblox") {
        const rid = profile?.sub ? String(profile.sub) : null;
        if (rid) token.robloxUserId = rid;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = session.user || {};
      session.user.discordId = token.discordId || null;
      session.user.robloxUserId = token.robloxUserId || null;
      return session;
    },
  },
};