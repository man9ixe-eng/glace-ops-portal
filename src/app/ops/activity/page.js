import { auth } from "@/lib/auth";

export default async function ActivityPage() {
  const session = await auth();

  if (!session) return <div>Not signed in.</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Your Activity</h1>
      <p className="text-sm text-white/60">
        Weekly stats reset every Monday.
      </p>

      <div className="mt-6 rounded-xl bg-[#0e1628] border border-white/10 p-6">
        <p className="text-white/70">Detailed logs coming next.</p>
      </div>
    </div>
  );
}
