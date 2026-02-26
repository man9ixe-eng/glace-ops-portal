import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function present(v) {
  return !!(v && String(v).trim().length > 0);
}

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_URL: present(process.env.NEXTAUTH_URL),
    NEXTAUTH_SECRET: present(process.env.NEXTAUTH_SECRET),
    DISCORD_CLIENT_ID: present(process.env.DISCORD_CLIENT_ID),
    DISCORD_CLIENT_SECRET: present(process.env.DISCORD_CLIENT_SECRET),
    ROBLOX_CLIENT_ID: present(process.env.ROBLOX_CLIENT_ID),
    ROBLOX_CLIENT_SECRET: present(process.env.ROBLOX_CLIENT_SECRET),
  });
}