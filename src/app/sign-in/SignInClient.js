"use client";

import { signIn, signOut } from "next-auth/react";

export default function SignInClient({ discordLinked, robloxLinked }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ width: 520, padding: 24, borderRadius: 16, background: "#121212", color: "#fff" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Glace Ops Panel</h1>
        <p style={{ marginTop: 8, opacity: 0.8 }}>Link Discord + Roblox to unlock your Ops dashboard.</p>

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <button
            onClick={() => signIn("discord", { callbackUrl: "/sign-in" })}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: discordLinked ? "#4ade80" : "#5865F2",
              color: "#0b0b0b",
              fontWeight: 700,
            }}
          >
            {discordLinked ? "Discord linked" : "Link Discord"}
          </button>

          <a
            href="/api/roblox/link/start"
            style={{
              display: "block",
              textAlign: "center",
              padding: "14px 16px",
              borderRadius: 12,
              background: robloxLinked ? "#4ade80" : "#ffffff",
              color: "#0b0b0b",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {robloxLinked ? "Roblox linked" : "Link Roblox"}
          </a>

          <button
            disabled={!(discordLinked && robloxLinked)}
            onClick={() => (window.location.href = "/ops")}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "none",
              cursor: discordLinked && robloxLinked ? "pointer" : "not-allowed",
              background: discordLinked && robloxLinked ? "#2f2f2f" : "#1f1f1f",
              color: "#bdbdbd",
              fontWeight: 700,
              opacity: discordLinked && robloxLinked ? 1 : 0.6,
            }}
          >
            Continue to Ops
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            style={{
              background: "transparent",
              border: "none",
              color: "#bdbdbd",
              textDecoration: "underline",
              cursor: "pointer",
              marginTop: 6,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}