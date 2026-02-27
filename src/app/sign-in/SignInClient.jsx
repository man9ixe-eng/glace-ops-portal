"use client";

import { signIn, signOut } from "next-auth/react";

export default function SignInClient({ discordLinked, robloxLinked }) {
  const canContinue = discordLinked && robloxLinked;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
        <p className="text-white/70 mt-2">
          Link Discord + Roblox to unlock your Ops dashboard.
        </p>

        <div className="mt-6 space-y-3">
          {!discordLinked ? (
            <button
              className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 transition px-4 py-3 font-medium"
              onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
            >
              Link Discord
            </button>
          ) : (
            <div className="w-full rounded-xl bg-emerald-300 text-black px-4 py-3 text-center font-medium">
              Discord linked
            </div>
          )}

          {!robloxLinked ? (
            <button
              className="w-full rounded-xl bg-white text-black hover:bg-white/90 transition px-4 py-3 font-medium"
              onClick={() => signIn("roblox", { callbackUrl: "/sign-in" })}
            >
              Link Roblox
            </button>
          ) : (
            <div className="w-full rounded-xl bg-emerald-300 text-black px-4 py-3 text-center font-medium">
              Roblox linked
            </div>
          )}

          <button
            className={
              "w-full rounded-xl px-4 py-3 font-medium " +
              (canContinue
                ? "bg-neutral-200 text-black hover:bg-neutral-100"
                : "bg-white/10 text-white/40 cursor-not-allowed")
            }
            disabled={!canContinue}
            onClick={() => (window.location.href = "/ops")}
          >
            Continue to Ops
          </button>

          <button
            className="w-full text-sm text-white/70 hover:text-white underline mt-2"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}