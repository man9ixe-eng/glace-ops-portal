export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { auth } from "@/lib/auth";

export default async function ActivityPage() {
  const session = await auth();
  const discordId = session?.user?.discordId;

  if (!discordId) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <p>Not signed in.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <h1 className="text-2xl font-semibold">Activity</h1>
      <p className="mt-2 text-white/70 text-sm">
        Connected Discord ID: {discordId}
      </p>
      <p className="mt-4 text-white/50 text-sm">
        Next: pull weekly minutes/sessions + discipline totals once Roblox + Discord log ingestion is wired.
      </p>
    </main>
  );
}
