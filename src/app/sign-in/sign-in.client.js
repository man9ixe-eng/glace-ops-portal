"use client";

import { signIn, signOut } from "next-auth/react";

export default function SignInClient({ discordLinked, robloxLinked }) {
  const canContinue = discordLinked && robloxLinked;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
        <p className="text-white/70 mt-1">
          Link Discord + Roblox to unlock your Ops dashboard.
        </p>

        <div className="mt-6 space-y-3">
          <button
            className={
              "w-full rounded-xl px-4 py-3 font-medium border " +
              (discordLinked
                ? "bg-emerald-300 text-black border-emerald-300"
                : "bg-white text-black border-white")
            }
            onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
            disabled={discordLinked}
          >
            {discordLinked ? "Discord linked" : "Link Discord"}
          </button>

          <button
            className={
              "w-full rounded-xl px-4 py-3 font-medium border " +
              (robloxLinked
                ? "bg-emerald-300 text-black border-emerald-300"
                : "bg-white text-black border-white")
            }
            onClick={() => signIn("roblox", { callbackUrl: "/sign-in" })}
            disabled={robloxLinked}
          >
            {robloxLinked ? "Roblox linked" : "Link Roblox"}
          </button>

          <button
            className={
              "w-full rounded-xl px-4 py-3 font-semibold " +
              (canContinue ? "bg-indigo-500 text-white" : "bg-white/10 text-white/40")
            }
            onClick={() => (window.location.href = "/ops")}
            disabled={!canContinue}
          >
            Continue to Ops
          </button>

          <button className="w-full text-white/70 underline" onClick={() => signOut({ callbackUrl: "/sign-in" })}>
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}