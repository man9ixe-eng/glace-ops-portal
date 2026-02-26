import DiscordProvider from "next-auth/providers/discord";

// Roblox OpenID Connect (OIDC)
// Key detail: Roblox can sign id_token with ES256, so we set the expected alg.
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oidc",
  issuer: "https://apis.roblox.com/oauth",
  wellKnown: "https://apis.roblox.com/oauth/.well-known/openid-configuration",
  authorization: { params: { scope: "openid profile" } },
  clientId: process.env.ROBLOX_CLIENT_ID,
  clientSecret: process.env.ROBLOX_CLIENT_SECRET,

  // openid-client tuning (used by next-auth under the hood)
  client: {
    // tell it to accept ES256-signed ID tokens
    id_token_signed_response_alg: "ES256",
  },

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
  debug: true, // ✅ makes next-auth log more details on Render

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
      // ✅ preserve both links (linking one never wipes the other)
      if (token.discordId === undefined) token.discordId = null;
      if (token.robloxUserId === undefined) token.robloxUserId = null;

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