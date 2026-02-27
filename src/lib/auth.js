import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// IMPORTANT:
// Do NOT throw on missing env at module import time.
// Next/Turbopack can evaluate route modules during build.
function env(name) {
  const v = process.env[name];
  return v && String(v).trim().length ? v : null;
}

export const authOptions = {
  // NextAuth will complain at runtime if missing; we avoid crashing build.
  secret: env("NEXTAUTH_SECRET"),

  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  providers: [
    DiscordProvider({
      clientId: env("DISCORD_CLIENT_ID"),
      clientSecret: env("DISCORD_CLIENT_SECRET"),
      authorization: { params: { scope: "identify" } },
    }),
    // NOTE:
    // If you're doing Roblox linking via your custom /api/roblox/link/* routes,
    // you do NOT need a NextAuth "roblox" provider here.
  ],

  callbacks: {
    async session({ session, user }) {
      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
        select: { provider: true, providerAccountId: true },
      });

      const discord = accounts.find((a) => a.provider === "discord");
      const roblox = accounts.find((a) => a.provider === "roblox");

      session.user = session.user || {};
      session.user.discordId = discord?.providerAccountId || null;
      session.user.robloxUserId = roblox?.providerAccountId || null;

      return session;
    },
  },
}; 
