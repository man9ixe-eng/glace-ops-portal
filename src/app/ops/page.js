import { auth } from "@/lib/auth";
import { fetchGlaceRoles } from "@/lib/bridge";

export default async function OpsPage() {
  const session = await auth();
  const discordId = session?.user?.discordId;

  if (!discordId) return <div>Not signed in.</div>;

  const roles = await fetchGlaceRoles(discordId);
  const tier = Number(roles?.tier || 0);

  if (tier < 1) return <div>No access.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
      <p className="text-sm text-white/60">Tier: {tier}</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          "Current Week Minutes",
          "Current Week Sessions",
          "Total Warnings",
          "Total Suspensions",
          "Total Demotions",
          "Total Terminations",
          "Quota Weeks Passed",
          "Quota Weeks Failed",
        ].map(label => (
          <div
            key={label}
            className="rounded-xl bg-[#0e1628] border border-white/10 p-4"
          >
            <p className="text-xs text-white/60">{label}</p>
            <p className="mt-2 text-2xl font-semibold">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
