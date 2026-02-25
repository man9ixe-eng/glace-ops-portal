export default function OpsLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#070b14] text-white">
      <aside className="w-64 bg-[#0b1220] border-r border-white/10 p-5">
        <h1 className="text-xl font-bold text-[#6fa8ff]">Glace Ops</h1>

        <nav className="mt-6 space-y-2 text-sm">
          <a href="/ops" className="block rounded-lg px-3 py-2 hover:bg-white/10">
            Dashboard
          </a>
          <a href="/ops/activity" className="block rounded-lg px-3 py-2 hover:bg-white/10">
            Activity
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
