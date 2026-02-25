import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const session = await getServerSession(authOptions);
  const discordId = session?.user?.discordId;

  if (!discordId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-semibold">Not signed in</h1>
          <p className="mt-2 text-sm text-white/70">Please sign in to access Ops.</p>
          <a className="mt-4 inline-block underline" href="/sign-in">Go to sign-in</a>
        </div>
      </main>
    );
  }

  let roles;
  try {
    roles = await fetchGlaceRoles(discordId);
  } catch (e) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-semibold">Access blocked</h1>
          <p className="mt-2 text-sm text-white/70">
            We couldn’t verify your Glace roles. You may not be in the server, or the bridge is unavailable.
          </p>
          <p className="mt-3 text-xs text-white/50">Reason: {String(e?.message || "unknown")}</p>
          <a className="mt-4 inline-block underline text-white/70" href="/api/auth/signout?callbackUrl=/sign-in">
            Sign out
          </a>
        </div>
      </main>
    );
  }

  const tier = Number(roles?.tier || 0);
  if (tier < 1) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-xl font-semibold">No Ops access</h1>
          <p className="mt-2 text-sm text-white/70">
            You’re verified, but you don’t have an Ops tier role.
          </p>
          <a className="mt-4 inline-block underline text-white/70" href="/api/auth/signout?callbackUrl=/sign-in">
            Sign out
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
              <p className="mt-1 text-sm text-white/70">
                Tier: <span className="text-white">{TIER_LABEL[tier] || `Tier ${tier}`}</span>
              </p>
              <p className="mt-1 text-xs text-white/50">Discord ID: {discordId}</p>
            </div>

            <a className="text-sm underline text-white/70" href="/api/auth/signout?callbackUrl=/sign-in">
              Sign out
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Activity Tracker" desc="Log shifts, trainings, interviews (Hyra-style)." />
            <Card title="Logbook" desc="Daily notes, incidents, handoffs." />
            <Card title="Ops Tools" desc="Tier-gated tools will live here." />
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-white/70">{desc}</p>
      <p className="mt-3 text-xs text-white/50">Next: database + real pages.</p>
    </div>
  );
}
