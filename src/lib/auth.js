import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`[AUTH] Missing env var: ${name}`);
  return v;
}

// Roblox OAuth/OIDC (Roblox id_token is ES256; accept ES256)
const RobloxProvider = {
  id: "roblox",
  name: "Roblox",
  type: "oauth",
  checks: ["pkce", "state"],
  authorization: {
    url: "https://apis.roblox.com/oauth/v1/authorize",
    // IMPORTANT: Roblox needs openid+profile to get sub/userinfo
    params: { scope: "openid profile" },
  },
  token: "https://apis.roblox.com/oauth/v1/token",
  userinfo: "https://apis.roblox.com/oauth/v1/userinfo",
  clientId: env("ROBLOX_CLIENT_ID"),
  clientSecret: env("ROBLOX_CLIENT_SECRET"),

  // ES256 accept
  client: {
    id_token_signed_response_alg: "ES256",
  },

  profile(profile) {
    const rid = profile?.sub ? String(profile.sub) : null;
    return {
      id: rid || "roblox",
      name: profile?.name || profile?.preferred_username || "Roblox User",
    };
  },
};

export const authOptions = {
  secret: env("NEXTAUTH_SECRET"),

  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  providers: [
    DiscordProvider({
      clientId: env("DISCORD_CLIENT_ID"),
      clientSecret: env("DISCORD_CLIENT_SECRET"),
      authorization: { params: { scope: "identify" } },
    }),
    RobloxProvider,
  ],

  callbacks: {
    async session({ session, user }) {
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