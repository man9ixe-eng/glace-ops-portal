import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function enc(v) {
  return encodeURIComponent(v || "");
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL("/sign-in", req.url));

  const { searchParams } = new URL(req.url);
  const callbackUrl = searchParams.get("callbackUrl") || "/sign-in";

  // Just bounce into your existing start flow (your file already should create state/verifier etc)
  // If your current implementation already does Roblox authorize redirect here, keep it.
  // This file is only to ensure it NEVER gets prerendered/cached.
  return NextResponse.redirect(new URL(`/api/roblox/link/start?callbackUrl=${enc(callbackUrl)}`, req.url));
}
