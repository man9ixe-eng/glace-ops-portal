export async function fetchGlaceRoles(discordUserId) {
  const base = process.env.OPS_BRIDGE_URL;
  const secret = process.env.OPS_SHARED_SECRET;
  const expectedGuild = process.env.GUILD_ID;

  if (!base) throw new Error("missing_ops_bridge_url");
  if (!secret) throw new Error("missing_ops_shared_secret");
  if (!discordUserId) throw new Error("missing_discord_user");

  const url = new URL("/internal/roles", base);
  url.searchParams.set("userId", String(discordUserId));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) throw new Error(data?.error || `bridge_${res.status}`);

  if (expectedGuild && String(data.guildId) !== String(expectedGuild)) {
    throw new Error("guild_mismatch");
  }

  return data;
}
