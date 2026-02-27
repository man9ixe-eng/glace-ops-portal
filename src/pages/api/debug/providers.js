import { authOptions } from "../../../lib/auth";

export default function handler(req, res) {
  try {
    const providers = (authOptions?.providers || []).map((p) => {
      // NextAuth provider can be function or object depending on provider
      const id = typeof p === "function" ? p().id : p.id;
      const name = typeof p === "function" ? p().name : p.name;
      const type = typeof p === "function" ? p().type : p.type;
      return { id, name, type };
    });

    res.status(200).json({
      ok: true,
      env: {
        NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
        ROBLOX_CLIENT_ID: !!process.env.ROBLOX_CLIENT_ID,
        ROBLOX_CLIENT_SECRET: !!process.env.ROBLOX_CLIENT_SECRET,
        DATABASE_URL: !!process.env.DATABASE_URL,
      },
      providers,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}