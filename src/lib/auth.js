import DiscordProvider from "next-auth/providers/discord";

// Roblox OpenID Connect (OIDC)
// Discovery shows id_token signing alg is ES256 (not RS256), so we MUST use OIDC discovery.
// https://apis.roblox.com/oauth/.well-known/openid-configuration
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oidc",
  issuer: "https://apis.roblox.com/oauth/",
  wellKnown: "https://apis.roblox.com/oauth/.well-known/openid-configuration",
  clientId: process.env.ROBLOX_CLIENT_ID,
  clientSecret: process.env.ROBLOX_CLIENT_SECRET,
  checks: ["pkce", "state"],
  authorization: { params: { scope: "openid profile" } },

  // Normalize Roblox user into a NextAuth profile shape
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
    async jwt({ token, account, profile }) {
      // ---- CRITICAL: preserve previously linked IDs (linking should NOT unlink) ----
      token.discordId = token.discordId ?? null;
      token.robloxUserId = token.robloxUserId ?? null;

      // Discord sign-in
      if (account?.provider === "discord") {
        const did = profile?.id ? String(profile.id) : null;
        if (did) token.discordId = did;
      }

      // Roblox sign-in (OIDC userinfo/id_token claims)
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