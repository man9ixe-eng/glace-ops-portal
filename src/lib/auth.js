import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// --- Roblox Provider ---
// If your Roblox OAuth is currently working, keep your working config.
// This is a generic OAuth config that uses Roblox /userinfo.
// NOTE: If you later re-hit id_token errors, we can harden it further.
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
  // REQUIRED for production
  secret: process.env.NEXTAUTH_SECRET,

  // ✅ THIS IS THE KEY: adapter enables account linking + DB sessions
  adapter: PrismaAdapter(prisma),

  // Use database sessions so linking persists cleanly
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
      // Add linked IDs into session by checking linked accounts
      // (so your /sign-in page can show "Discord linked" + "Roblox linked")
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