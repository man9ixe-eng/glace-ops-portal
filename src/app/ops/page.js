import { auth } from "@/lib/auth";
import { fetchRobloxGroupInfo, fetchRobloxHeadshotUrl } from "@/lib/roblox";
import { fetchGlaceRoles } from "@/lib/bridge";

export default async function OpsPage() {
  const session = await auth();
  const discordId = session?.user?.discordId;
  const robloxUserId = session?.user?.robloxUserId;

  if (!discordId || !robloxUserId) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 max-w-xl">
          <h1 className="text-xl font-semibold">Link required</h1>
          <p className="mt-2 text-white/70 text-sm">
            You must link both Discord and Roblox to access Ops.
          </p>
          <a className="inline-block mt-4 underline" href="/sign-in">Go to sign-in</a>
        </div>
      </main>
    );
  }

  // Discord tier (from your bridge)
  const glace = await fetchGlaceRoles(discordId);

  // Roblox group verification
  const group = await fetchRobloxGroupInfo(robloxUserId);
  const headshot = await fetchRobloxHeadshotUrl(robloxUserId);

  // Example rule: must be in group (you can add min rank checks later)
  if (!group.inGroup) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 max-w-xl">
          <h1 className="text-xl font-semibold">Access blocked</h1>
          <p className="mt-2 text-white/70 text-sm">
            Your Roblox account is not in the Glace group.
          </p>
          <p className="mt-3 text-xs text-white/50">
            Discord OK. Roblox group check failed.
          </p>
          <a className="inline-block mt-4 underline" href="/api/auth/signout?callbackUrl=/sign-in">Sign out</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="flex items-center gap-4">
        {headshot ? (
          <img
            src={headshot}
            alt="Roblox avatar"
            className="h-14 w-14 rounded-2xl border border-white/10"
          />
        ) : (
          <div className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5" />
        )}

        <div>
          <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
          <p className="text-sm text-white/70">
            Discord Tier: {Number(glace?.tier || 0)} • Roblox Rank: {group.rank} ({group.role || "Unknown"})
          </p>
        </div>

        <a className="ml-auto text-sm underline text-white/70" href="/api/auth/signout?callbackUrl=/sign-in">
          Sign out
        </a>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Current Week Minutes</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Current Week Sessions</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60">Total Warnings</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
      </div>
    </main>
  );
}
