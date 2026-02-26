"use client";

import { signIn, signOut } from "next-auth/react";

export default function SignInButtons({ discordLinked, robloxLinked }) {
  return (
    <div className="mt-5 space-y-3">
      {discordLinked ? (
        <button
          className="w-full rounded-xl bg-emerald-300 text-black py-3 font-semibold"
          disabled
        >
          Discord linked
        </button>
      ) : (
        <button
          className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 transition text-white py-3 font-semibold"
          onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
        >
          Link Discord
        </button>
      )}

      {robloxLinked ? (
        <button
          className="w-full rounded-xl bg-emerald-300 text-black py-3 font-semibold"
          disabled
        >
          Roblox linked
        </button>
      ) : (
        <button
          className="w-full rounded-xl bg-white hover:bg-white/90 transition text-black py-3 font-semibold border border-white/10"
          onClick={() => signIn("roblox", { callbackUrl: "/sign-in" })}
        >
          Link Roblox
        </button>
      )}

      <button
        className={
          "w-full rounded-xl py-3 font-semibold " +
          (discordLinked && robloxLinked
            ? "bg-white text-black hover:bg-white/90 transition"
            : "bg-white/10 text-white/40 cursor-not-allowed")
        }
        disabled={!(discordLinked && robloxLinked)}
        onClick={() => {
          if (discordLinked && robloxLinked) window.location.href = "/ops";
        }}
      >
        Continue to Ops
      </button>

      <button
        className="w-full text-sm text-white/70 hover:text-white underline underline-offset-4"
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
      >
        Sign out
      </button>
    </div>
  );
}