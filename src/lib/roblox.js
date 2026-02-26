export async function fetchRobloxGroupInfo(robloxUserId) {
  const groupId = process.env.ROBLOX_GROUP_ID;
  if (!groupId) throw new Error("missing_roblox_group_id");
  if (!robloxUserId) throw new Error("missing_roblox_user");

  const url = `https://groups.roblox.com/v2/users/${encodeURIComponent(
    robloxUserId
  )}/groups/roles`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.data) {
    throw new Error(`roblox_groups_${res.status}`);
  }

  const row = data.data.find((x) => String(x?.group?.id) === String(groupId));

  if (!row) {
    return { inGroup: false, groupId: String(groupId), rank: 0, role: null };
  }

  return {
    inGroup: true,
    groupId: String(groupId),
    rank: Number(row?.role?.rank || 0),
    role: row?.role?.name || null,
  };
}

export async function fetchRobloxHeadshotUrl(robloxUserId) {
  if (!robloxUserId) return null;

  const url =
    "https://thumbnails.roblox.com/v1/users/avatar-headshot" +
    `?userIds=${encodeURIComponent(robloxUserId)}` +
    "&size=150x150&format=Png&isCircular=true";

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  const imageUrl = data?.data?.[0]?.imageUrl || null;
  return imageUrl;
}
