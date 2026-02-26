import DiscordProvider from "next-auth/providers/discord";

// Roblox OAuth (NOT OpenID) - avoids id_token alg issues (ES256 vs RS256)
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oauth",
  checks: ["pkce", "state"],

  // IMPORTANT: Do NOT request "openid" to prevent NextAuth expecting/validating id_token
  authorization: {
    url: "https://apis.roblox.com/oauth/v1/authorize",
    params: { scope: "profile" },
  },

  token: "https://apis.roblox.com/oauth/v1/token",

  // Tell NextAuth NOT to use/verify id_token
  idToken: false,

  // Fetch Roblox identity using the access token
  userinfo: {
    url: "https://apis.roblox.com/oauth/v1/userinfo",
    async request({ tokens, provider }) {
      const res = await fetch(provider.userinfo.url, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Roblox userinfo failed: ${res.status} ${txt}`);
      }
      return await res.json();
    },
  },

  clientId: process.env.ROBLOX_CLIENT_ID,
  clientSecret: process.env.ROBLOX_CLIENT_SECRET,

  profile(profile) {
    const id = profile?.sub ? String(profile.sub) : null;
    return {
      id: id || "roblox",
      name: profile?.name || profile?.preferred_username || "Roblox User",
      robloxUserId: id,
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
      if (account?.provider === "discord" && profile?.id) {
        token.discordId = String(profile.id);
      }
      if (account?.provider === "roblox") {
        const rid = profile?.sub ? String(profile.sub) : null;
        if (rid) token.robloxUserId = rid;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId = token.discordId || null;
      session.user.robloxUserId = token.robloxUserId || null;
      return session;
    },
  },
};