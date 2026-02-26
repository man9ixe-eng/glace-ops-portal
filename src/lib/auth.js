import DiscordProvider from "next-auth/providers/discord";

// Roblox OAuth (Roblox uses ES256 for some JWTs; NextAuth v4 OIDC path expects RS256).
// Fix: treat as generic OAuth + rely on /userinfo, and explicitly disable idToken handling.
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oauth",
  idToken: false,
  checks: ["pkce", "state"],
  authorization: {
    url: "https://apis.roblox.com/oauth/v1/authorize",
    params: { scope: "openid profile" },
  },
  token: "https://apis.roblox.com/oauth/v1/token",
  userinfo: "https://apis.roblox.com/oauth/v1/userinfo",
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
      // Preserve existing values (this is the "link doesn't unlink" fix)
      token.discordId = token.discordId ?? null;
      token.robloxUserId = token.robloxUserId ?? null;

      if (account?.provider === "discord") {
        // Discord profile can come in different shapes; keep it safe
        const did = profile?.id ? String(profile.id) : null;
        if (did) token.discordId = did;
      }

      if (account?.provider === "roblox") {
        // Roblox userinfo: sub = user id
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