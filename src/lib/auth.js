import DiscordProvider from "next-auth/providers/discord";

const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oauth",
  checks: ["pkce", "state"],

  // Roblox OIDC discovery (so NextAuth/openid-client knows jwks + algs)
  wellKnown: "https://apis.roblox.com/oauth/.well-known/openid-configuration",

  authorization: {
    params: {
      scope: "openid profile",
    },
  },

  idToken: true,
  clientId: process.env.ROBLOX_CLIENT_ID,
  clientSecret: process.env.ROBLOX_CLIENT_SECRET,

  // Force ES256 because Roblox ID tokens are ES256 in your logs
  client: {
    id_token_signed_response_alg: "ES256",
  },

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