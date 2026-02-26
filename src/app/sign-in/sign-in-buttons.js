"use client";

import { signIn, signOut } from "next-auth/react";

export default function SignInButtons({ discordLinked, robloxLinked }) {
  const canContinue = discordLinked && robloxLinked;

  return (
    <>
      <button
        className={`w-full rounded-xl px-4 py-3 font-semibold transition ${
          discordLinked ? "bg-emerald-300 text-black" : "bg-white text-black hover:opacity-90"
        }`}
        onClick={() => signIn("discord")}
        type="button"
      >
        {discordLinked ? "Discord linked!" : "Link Discord"}
      </button>

      <button
        className={`w-full rounded-xl px-4 py-3 font-semibold transition ${
          robloxLinked ? "bg-emerald-300 text-black" : "bg-white text-black hover:opacity-90"
        }`}
        onClick={() => signIn("roblox")}
        type="button"
      >
        {robloxLinked ? "Roblox linked!" : "Link Roblox"}
      </button>

      <button
        className={`w-full rounded-xl px-4 py-3 font-semibold ${
          canContinue ? "bg-white/10 hover:bg-white/15" : "bg-white/5 opacity-40 cursor-not-allowed"
        }`}
        onClick={() => {
          if (canContinue) window.location.href = "/ops";
        }}
        type="button"
        disabled={!canContinue}
      >
        Continue to Ops
      </button>

      <button
        className="w-full text-sm text-white/70 hover:text-white underline underline-offset-4 mt-2"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        type="button"
      >
        Sign out
      </button>
    </>
  );
}