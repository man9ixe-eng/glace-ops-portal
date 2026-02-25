export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Glace Ops Panel</h1>
        <p className="mt-2 text-sm text-white/70">
          Sign in with Discord. Access is verified server-side using your Glace roles.
        </p>

        <a
          className="mt-6 block w-full rounded-xl bg-white text-black px-4 py-3 text-center font-semibold hover:opacity-90"
          href="/api/auth/signin/discord?callbackUrl=/ops"
        >
          Sign in with Discord
        </a>
      </div>
    </main>
  );
}
