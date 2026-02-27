"use client";

import { signIn } from "next-auth/react";

export default function SignInClient({ discordLinked, robloxLinked }) {
  const linkDiscord = () => {
    signIn("discord", { callbackUrl: "/sign-in" });
  };

  const linkRoblox = () => {
    window.location.href = "/api/roblox/link/start?callbackUrl=%2Fsign-in";
  };

  const canContinue = discordLinked && robloxLinked;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 420, padding: 24, borderRadius: 16, background: "#111", color: "#fff" }}>
        <h2>Glace Ops Panel</h2>
        <p>Link Discord + Roblox to unlock your Ops dashboard.</p>

        <button onClick={linkDiscord} disabled={discordLinked}>
          {discordLinked ? "Discord linked" : "Link Discord"}
        </button>

        <button onClick={linkRoblox} disabled={robloxLinked}>
          {robloxLinked ? "Roblox linked" : "Link Roblox"}
        </button>

        <button disabled={!canContinue} onClick={() => (window.location.href = "/ops")}>
          Continue to Ops
        </button>

        <a href="/api/auth/signout?callbackUrl=%2Fsign-in">Sign out</a>
      </div>
    </div>
  );
}
