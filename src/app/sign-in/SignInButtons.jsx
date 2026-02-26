"use client";

import { signIn, signOut } from "next-auth/react";

export default function SignInButtons({ discordLinked, robloxLinked }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
      <p className="text-white/70 mt-1 mb-6">Link Discord + Roblox to unlock your Ops dashboard.</p>

      <button
        className={"w-full rounded-xl px-4 py-3 font-semibold mb-3 " + (discordLinked ? "bg-emerald-200 text-black" : "bg-indigo-500 text-white")}
        onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
      >
        {discordLinked ? "Discord linked" : "Link Discord"}
      </button>

      <button
        className={"w-full rounded-xl px-4 py-3 font-semibold mb-3 " + (robloxLinked ? "bg-emerald-200 text-black" : "bg-white text-black")}
        onClick={() => signIn("roblox", { callbackUrl: "/sign-in" })}
      >
        {robloxLinked ? "Roblox linked" : "Link Roblox"}
      </button>

      {/* Fallback link (if client JS ever fails, this still MUST start Roblox OAuth) */}
      <a
        className="block text-center text-white/60 underline mt-2"
        href="/api/auth/signin/roblox?callbackUrl=%2Fsign-in"
      >
        (Roblox fallback link)
      </a>

      <button
        className={"w-full rounded-xl px-4 py-3 font-semibold mt-5 " + (discordLinked && robloxLinked ? "bg-white/10 text-white" : "bg-white/5 text-white/40 cursor-not-allowed")}
        disabled={!(discordLinked && robloxLinked)}
        onClick={() => (window.location.href = "/ops")}
      >
        Continue to Ops
      </button>

      <button className="w-full text-white/60 underline mt-3" onClick={() => signOut({ callbackUrl: "/sign-in" })}>
        Sign out
      </button>
    </div>
  );
}