"use client";

import { signIn } from "next-auth/react";

export default function SignInClient({ discordLinked, robloxLinked }) {
  const canContinue = discordLinked && robloxLinked;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 420, padding: 24, borderRadius: 16, background: "#111", color: "#fff" }}>
        <h2>Glace Ops Panel</h2>
        <p>Link Discord + Roblox to unlock your Ops dashboard.</p>

        <button
          onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
          disabled={discordLinked}
          style={{ width: "100%", padding: 12, marginTop: 10, opacity: discordLinked ? 0.6 : 1 }}
        >
          {discordLinked ? "Discord linked" : "Link Discord"}
        </button>

        {robloxLinked ? (
          <button
            disabled
            style={{ width: "100%", padding: 12, marginTop: 10, opacity: 0.6 }}
          >
            Roblox linked
          </button>
        ) : (
          <a
            href="/api/roblox/link/start?callbackUrl=%2Fsign-in"
            style={{
              display: "block",
              width: "100%",
              padding: 12,
              marginTop: 10,
              textAlign: "center",
              background: "#222",
              borderRadius: 8,
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Link Roblox
          </a>
        )}

        <button
          disabled={!canContinue}
          onClick={() => (window.location.href = "/ops")}
          style={{ width: "100%", padding: 12, marginTop: 14, opacity: canContinue ? 1 : 0.5 }}
        >
          Continue to Ops
        </button>

        <a
          href="/api/auth/signout?callbackUrl=%2Fsign-in"
          style={{ display: "block", marginTop: 14, color: "#bbb" }}
        >
          Sign out
        </a>
      </div>
    </div>
  );
}
