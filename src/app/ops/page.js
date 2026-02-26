export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { fetchGlaceRoles } from "@/lib/bridge";

const TIER_LABEL = {
  1: "Intern",
  2: "Management",
  3: "Senior Management",
  4: "Corporate",
  5: "Corporate Board",
  6: "President",
};

export default async function OpsPage() {
  const session = await auth();
  const discordId = session?.user?.discordId;

  if (!discordId) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <p>Not signed in.</p>
      </main>
    );
  }

  let roles;
  try {
    roles = await fetchGlaceRoles(discordId);
  } catch (e) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <h1 className="text-2xl font-semibold">Access blocked</h1>
        <p className="mt-2 text-white/70">
          We couldn’t verify your Glace roles. You may not be in the server, or the bridge is unavailable.
        </p>
        <p className="mt-2 text-white/50 text-sm">Reason: {String(e?.message || e)}</p>
        <a className="underline mt-4 inline-block" href="/api/auth/signout">Sign out</a>
      </main>
    );
  }

  const tier = Number(roles?.tier || 0);
  if (tier < 1) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <p>No Ops access.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
      <p className="mt-1 text-sm text-white/70">Tier: {TIER_LABEL[tier] || `Tier ${tier}`}</p>
      <p className="mt-1 text-sm text-white/50">Discord ID: {discordId}</p>
    </main>
  );
}
