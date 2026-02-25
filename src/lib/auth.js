import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

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
      session.user.discordId = token.discordId || null;
      return session;
    },
  },
};

export const { handlers, auth } = NextAuth(authOptions);
