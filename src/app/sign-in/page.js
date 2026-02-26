import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  const discordLinked = Boolean(session?.user?.discordId);
  const robloxLinked = Boolean(session?.user?.robloxUserId);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
        <p className="mt-2 text-sm text-white/70">
          Link Discord + Roblox to unlock your Ops dashboard.
        </p>

        <div className="mt-6 space-y-3">
          <a
            className={`block w-full rounded-xl px-4 py-3 text-center font-semibold hover:opacity-90 ${
              discordLinked ? "bg-emerald-200 text-black" : "bg-white text-black"
            }`}
            href="/api/auth/signin/discord?callbackUrl=/sign-in"
          >
            {discordLinked ? "Discord linked ✅" : "Link Discord"}
          </a>

          <a
            className={`block w-full rounded-xl px-4 py-3 text-center font-semibold hover:opacity-90 ${
              robloxLinked ? "bg-emerald-200 text-black" : "bg-white text-black"
            }`}
            href="/api/auth/signin/roblox?callbackUrl=/sign-in"
          >
            {robloxLinked ? "Roblox linked ✅" : "Link Roblox"}
          </a>

          <a
            className={`block w-full rounded-xl px-4 py-3 text-center font-semibold ${
              discordLinked && robloxLinked
                ? "bg-sky-300 text-black hover:opacity-90"
                : "bg-white/10 text-white/40 pointer-events-none"
            }`}
            href="/ops"
          >
            Continue to Ops
          </a>

          <a className="block text-center text-sm text-white/70 underline" href="/api/auth/signout?callbackUrl=/sign-in">
            Sign out
          </a>
        </div>
      </div>
    </main>
  );
}
