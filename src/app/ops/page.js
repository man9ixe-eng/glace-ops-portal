import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/sign-in");

  // If you want to REQUIRE both linked, enforce here:
  // if (!session.user?.discordId || !session.user?.robloxUserId) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
      <p className="mt-2 text-white/70">
        Signed in.
      </p>
    </main>
  );
}