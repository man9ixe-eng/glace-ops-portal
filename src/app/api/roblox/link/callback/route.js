import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  // Dynamically import ONLY when request happens (prevents build evaluation crashes)
  const [{ getServerSession }, { authOptions }] = await Promise.all([
    import("next-auth/next"),
    import("@/lib/auth"),
  ]);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("error", "NotSignedIn");
    return NextResponse.redirect(url);
  }

  // ...your existing Roblox code exchange logic here...
  // After success:
  const ok = new URL("/sign-in", req.url);
  ok.searchParams.set("linked", "roblox");
  return NextResponse.redirect(ok);
} 
