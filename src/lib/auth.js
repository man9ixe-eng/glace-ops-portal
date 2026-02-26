import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { getServerSession } from "next-auth/next";

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
    const id = profile?.sub ? String(profile.sub) : null;
    return {
      id: id || "roblox",
      name: profile?.name || profile?.preferred_username || "Roblox User",
      robloxUserId: id,
    };
  },
};

export const authOptions = {
  trustHost: true,
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
      if (account?.provider === "discord" && profile?.id) {
        token.discordId = String(profile.id);
      }
      if (account?.provider === "roblox") {
        const rid = profile?.sub ? String(profile.sub) : null;
        if (rid) token.robloxUserId = rid;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId = token.discordId || null;
      session.user.robloxUserId = token.robloxUserId || null;
      return session;
    },
  },
};

// ✅ Route handler factory (v4 style)
export function nextAuthHandler() {
  return NextAuth(authOptions);
}

// ✅ Server-side session helper used by app pages
export async function auth() {
  return getServerSession(authOptions);
}
