import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist Discord user id in the token
      if (account?.provider === "discord" && profile?.id) {
        token.discordId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Copy discordId into the session (server-side + client-side)
      if (!session.user) session.user = {};
      session.user.discordId = token.discordId || null;
      return session;
    },
  },
};
