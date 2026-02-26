"use client";

import { signIn, signOut } from "next-auth/react";

export default function SignInButtons({ discordLinked, robloxLinked }) {
  return (
    <div className="mt-6 space-y-3">
      {discordLinked ? (
        <div className="w-full rounded-xl bg-emerald-300/90 text-black font-semibold py-3 text-center">
          Discord linked
        </div>
      ) : (
        <button
          className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3"
          onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
        >
          Link Discord
        </button>
      )}

      {robloxLinked ? (
        <div className="w-full rounded-xl bg-emerald-300/90 text-black font-semibold py-3 text-center">
          Roblox linked
        </div>
      ) : (
        <button
          className="w-full rounded-xl bg-white hover:bg-white/90 text-black font-semibold py-3"
          onClick={() => signIn("roblox", { callbackUrl: "/sign-in" })}
        >
          Link Roblox
        </button>
      )}

      <button
        className="w-full rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold py-3 disabled:opacity-40"
        disabled={!(discordLinked && robloxLinked)}
        onClick={() => (window.location.href = "/ops")}
      >
        Continue to Ops
      </button>

      <button
        className="w-full text-white/70 hover:text-white underline text-sm pt-1"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
      >
        Sign out
      </button>
    </div>
  );
}