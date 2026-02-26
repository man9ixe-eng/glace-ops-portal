"use client";

import { useMemo } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const discordId = session?.user?.discordId || null;
  const robloxUserId = session?.user?.robloxUserId || null;

  const discordLinked = !!discordId;
  const robloxLinked = !!robloxUserId;

  const ready = discordLinked && robloxLinked;

  const subtext = useMemo(() => {
    if (status === "loading") return "Loading your session...";
    return "Link Discord + Roblox to unlock your Ops dashboard.";
  }, [status]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
        <p className="mt-2 text-sm text-white/70">{subtext}</p>

        <div className="mt-6 space-y-3">
          {/* Discord */}
          {discordLinked ? (
            <div className="w-full rounded-xl bg-emerald-300 text-black font-semibold py-3 text-center">
              Discord linked
            </div>
          ) : (
            <button
              className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 transition font-semibold py-3"
              onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
            >
              Link Discord
            </button>
          )}

          {/* Roblox */}
          {robloxLinked ? (
            <div className="w-full rounded-xl bg-emerald-300 text-black font-semibold py-3 text-center">
              Roblox linked
            </div>
          ) : (
            <button
              className="w-full rounded-xl bg-white text-black hover:bg-white/90 transition font-semibold py-3"
              onClick={() => signIn("roblox", { callbackUrl: "/sign-in" })}
            >
              Link Roblox
            </button>
          )}

          <button
            className={
              "w-full rounded-xl font-semibold py-3 transition " +
              (ready ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/40 cursor-not-allowed")
            }
            disabled={!ready}
            onClick={() => router.push("/ops")}
          >
            Continue to Ops
          </button>

          <button
            className="w-full text-sm underline text-white/70 hover:text-white mt-2"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}