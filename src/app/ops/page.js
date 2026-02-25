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
    return <div className="p-6 text-white">Not signed in.</div>;
  }

  const roles = await fetchGlaceRoles(discordId);
  const tier = Number(roles?.tier || 0);

  if (tier < 1) {
    return <div className="p-6 text-white">No Ops access.</div>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
      <p className="mt-1 text-sm text-white/70">Tier: {TIER_LABEL[tier]}</p>
    </main>
  );
}
