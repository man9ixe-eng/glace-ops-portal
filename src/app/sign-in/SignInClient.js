"use client";

import { signIn } from "next-auth/react";

export default function SignInClient({ discordLinked, robloxLinked }) {
  const canContinue = discordLinked && robloxLinked;

  const goRoblox = () => {
    // hard navigation (no Next.js router)
    window.location.assign("/api/roblox/link/start?callbackUrl=%2Fsign-in");
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 420, padding: 24, borderRadius: 16, background: "#111", color: "#fff" }}>
        <h2>Glace Ops Panel</h2>
        <p>Link Discord + Roblox to unlock your Ops dashboard.</p>

        <button
          onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
          disabled={discordLinked}
          style={{ width: "100%", padding: 12, marginTop: 10, borderRadius: 10 }}
        >
          {discordLinked ? "Discord linked" : "Link Discord"}
        </button>

        <button
          onClick={goRoblox}
          disabled={robloxLinked}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 10,
            borderRadius: 10,
            background: robloxLinked ? "#333" : "#fff",
            color: robloxLinked ? "#aaa" : "#000",
            fontWeight: 600,
            opacity: robloxLinked ? 0.6 : 1,
            cursor: robloxLinked ? "not-allowed" : "pointer",
          }}
        >
          {robloxLinked ? "Roblox linked" : "Link Roblox"}
        </button>

        <button
          disabled={!canContinue}
          onClick={() => (window.location.href = "/ops")}
          style={{ width: "100%", padding: 12, marginTop: 14, borderRadius: 10, opacity: canContinue ? 1 : 0.5 }}
        >
          Continue to Ops
        </button>

        <a href="/api/auth/signout?callbackUrl=%2Fsign-in" style={{ display: "block", marginTop: 14, color: "#bbb" }}>
          Sign out
        </a>
      </div>
    </div>
  );
}
