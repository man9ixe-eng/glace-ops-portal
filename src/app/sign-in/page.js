import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInButtons from "./SignInButtons";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  const discordLinked = !!session?.user?.discordId;
  const robloxLinked = !!session?.user?.robloxUserId;

  // Show "Try a different account" only if user hit an error query param, keep it simple.
  // NextAuth may redirect back with ?error=... sometimes.
  // We intentionally avoid emojis to prevent mojibake on Windows.
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
        <p className="text-white/70 mt-1">
          Link Discord + Roblox to unlock your Ops dashboard.
        </p>

        <SignInButtons discordLinked={discordLinked} robloxLinked={robloxLinked} />
      </div>
    </main>
  );
}