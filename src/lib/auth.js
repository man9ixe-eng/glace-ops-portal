import DiscordProvider from "next-auth/providers/discord";
import { getServerSession } from "next-auth";

export const authOptions = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      if (account?.provider === "discord" && profile?.id) {
        token.discordId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.discordId = token.discordId || null;
      return session;
    },
  },
};

export async function auth() {
  return getServerSession(authOptions);
}
