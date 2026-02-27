import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`[AUTH] Missing env var: ${name}`);
  return v;
}

export const authOptions = {
  secret: env("NEXTAUTH_SECRET"),

  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  providers: [
    DiscordProvider({
      clientId: env("DISCORD_CLIENT_ID"),
      clientSecret: env("DISCORD_CLIENT_SECRET"),
      authorization: { params: { scope: "identify email" } },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      // expose internal user id (needed for linking)
      session.user = session.user || {};
      session.user.id = user.id;

      // read linked providers from DB
      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
        select: { provider: true, providerAccountId: true },
      });

      const discord = accounts.find(a => a.provider === "discord");
      const roblox  = accounts.find(a => a.provider === "roblox");

      session.user.discordId = discord?.providerAccountId || null;
      session.user.robloxUserId = roblox?.providerAccountId || null;

      return session;
    },
  },
};