import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInButtons from "./sign-in-buttons";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  const discordLinked = Boolean(session?.user?.discordId);
  const robloxLinked = Boolean(session?.user?.robloxUserId);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
        <p className="text-white/60 mt-1">
          Link Discord + Roblox to unlock your Ops dashboard.
        </p>

        <div className="mt-6 space-y-3">
          <SignInButtons discordLinked={discordLinked} robloxLinked={robloxLinked} />
        </div>

        <div className="mt-4 text-sm text-white/60">
          {discordLinked && robloxLinked ? (
            <span>All set. Continue to Ops.</span>
          ) : (
            <span>Both accounts must be linked.</span>
          )}
        </div>
      </div>
    </main>
  );
}