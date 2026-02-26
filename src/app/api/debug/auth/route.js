import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const providers = (authOptions.providers || []).map((p) => ({
    id: p?.id,
    name: p?.name,
    type: p?.type,
  }));

  const env = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DISCORD_CLIENT_ID: !!process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: !!process.env.DISCORD_CLIENT_SECRET,
    ROBLOX_CLIENT_ID: !!process.env.ROBLOX_CLIENT_ID,
    ROBLOX_CLIENT_SECRET: !!process.env.ROBLOX_CLIENT_SECRET,
  };

  return NextResponse.json({ ok: true, providers, env });
}