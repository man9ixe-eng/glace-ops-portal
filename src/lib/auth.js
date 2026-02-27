import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Roblox OAuth
// IMPORTANT: Roblox basic identity scopes are "openid profile" (NOT profile:read).
// If your Roblox app category/policy blocks some scopes, fix it in Roblox Creator Dashboard.
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oauth",
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
    // Roblox userinfo: sub is the Roblox user id
    const rid = profile?.sub ? String(profile.sub) : null;
    return {
      id: rid || "roblox",
      name: profile?.name || profile?.preferred_username || "Roblox User",
    };
  },
};

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Makes provider linking persistent
  adapter: PrismaAdapter(prisma),

  // ✅ Use DB sessions (recommended when using adapter)
  session: { strategy: "database" },

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify" } },
    }),
    RobloxProvider,
  ],

  callbacks: {
    async session({ session, user }) {
      // expose linked ids to UI
      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
        select: { provider: true, providerAccountId: true },
      });

      const discord = accounts.find(a => a.provider === "discord");
      const roblox = accounts.find(a => a.provider === "roblox");

      session.user = session.user || {};
      session.user.discordId = discord?.providerAccountId || null;
      session.user.robloxUserId = roblox?.providerAccountId || null;

      return session;
    },
  },
};