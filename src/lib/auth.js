import DiscordProvider from "next-auth/providers/discord";

/**
 * Roblox OAuth / OIDC
 * - We use the official OpenID configuration endpoint
 * - Force ES256 for the id_token signing alg (Roblox can use ES256)
 * - Keep PKCE + state
 *
 * NOTE:
 * If your Render / env ROBLOX_CLIENT_ID or ROBLOX_CLIENT_SECRET are empty,
 * Roblox will not appear in /api/auth/providers.
 */
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oidc",
  wellKnown: "https://apis.roblox.com/oauth/.well-known/openid-configuration",
  checks: ["pkce", "state"],
  authorization: {
    params: { scope: "openid profile" },
  },
  clientId: process.env.ROBLOX_CLIENT_ID,
  clientSecret: process.env.ROBLOX_CLIENT_SECRET,

  // Important for Roblox token exchange in many setups:
  // (If yours works without it, it still doesn't hurt.)
  client: {
    token_endpoint_auth_method: "client_secret_post",
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

  // KEY FIX: Never show the default /api/auth/signin page
  pages: {
    signIn: "/sign-in",
  },

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
      // KEY FIX: preserve BOTH ids (linking one must not wipe the other)
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