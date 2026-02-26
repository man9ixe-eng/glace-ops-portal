import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OpsActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <h1 className="text-2xl font-semibold">Activity</h1>
      <p className="mt-2 text-white/70">
        Signed in.
      </p>
    </main>
  );
}