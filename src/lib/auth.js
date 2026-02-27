import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function env(name) {
  const v = process.env[name];
  return v && String(v).trim().length ? v : null;
}

export const authOptions = {
  secret: env("NEXTAUTH_SECRET"),

  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  providers: [
    DiscordProvider({
      clientId: env("DISCORD_CLIENT_ID"),
      clientSecret: env("DISCORD_CLIENT_SECRET"),
      authorization: { params: { scope: "identify" } },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      // ✅ Always expose DB user id
      session.user = session.user || {};
      session.user.id = user?.id || null;

      // ✅ Also expose linked providers (your UI uses these)
      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
        select: { provider: true, providerAccountId: true },
      });

      const discord = accounts.find(a => a.provider === "discord");
      const roblox = accounts.find(a => a.provider === "roblox");

      session.user.discordId = discord?.providerAccountId || null;
      session.user.robloxUserId = roblox?.providerAccountId || null;

      return session;
    },
  },
};
