import DiscordProvider from "next-auth/providers/discord";

// Roblox OAuth/OIDC
// Roblox returns id_token + uses ES256 in some cases.
// NextAuth v4 works best by treating Roblox as OIDC with discovery.
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oidc",
  wellKnown: "https://apis.roblox.com/oauth/.well-known/openid-configuration",
  clientId: process.env.ROBLOX_CLIENT_ID,
  clientSecret: process.env.ROBLOX_CLIENT_SECRET,
  authorization: {
    params: { scope: "openid profile" },
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
      // ✅ Preserve values so linking Roblox doesn't wipe Discord and vice versa
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