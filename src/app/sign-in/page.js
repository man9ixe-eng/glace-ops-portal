"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then(r => r.json())
      .then(setProviders)
      .catch(() => setProviders(null));
  }, []);

  const discordLinked = !!session?.user?.discordId;
  const robloxLinked = !!session?.user?.robloxUserId;

  const hasDiscord = !!providers?.discord;
  const hasRoblox = !!providers?.roblox;

  const ready = status !== "loading";

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Glace Ops Portal</h1>
          <p className="text-white/70 text-sm">Link Discord + Roblox to access the panel.</p>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Discord</div>
                <div className="text-xs text-white/60">
                  Status: {discordLinked ? "Linked" : "Not linked"}
                </div>
              </div>

              <button
                className="rounded-lg px-3 py-2 text-sm bg-white text-black disabled:opacity-50"
                disabled={!ready || !hasDiscord || discordLinked}
                onClick={() => signIn("discord", { callbackUrl: "/ops" })}
              >
                {hasDiscord ? (discordLinked ? "Linked" : "Link") : "Missing"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Roblox</div>
                <div className="text-xs text-white/60">
                  Status: {robloxLinked ? "Linked" : "Not linked"}
                </div>
              </div>

              <button
                className="rounded-lg px-3 py-2 text-sm bg-white text-black disabled:opacity-50"
                disabled={!ready || !hasRoblox || robloxLinked}
                onClick={() => signIn("roblox", { callbackUrl: "/ops" })}
              >
                {hasRoblox ? (robloxLinked ? "Linked" : "Link") : "Missing"}
              </button>
            </div>

            {!hasRoblox && (
              <div className="mt-2 text-xs text-red-300">
                Roblox provider not loaded. Check Render env vars and redeploy.
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <a
              href="/ops"
              className="flex-1 text-center rounded-lg px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10"
            >
              Go to Ops
            </a>

            <button
              className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-white/5 hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              disabled={!ready}
            >
              Log out
            </button>
          </div>

          <div className="pt-2 text-xs text-white/50">
            Providers loaded: {providers ? Object.keys(providers).join(", ") : "loading..."}
          </div>
        </div>
      </div>
    </main>
  );
}