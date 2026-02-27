export function getPublicBaseUrl(req) {
  // Prefer explicit env vars (best on Render)
  const envBase =
    process.env.OPS_PORTAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (envBase && String(envBase).trim()) {
    return String(envBase).replace(/\/$/, "");
  }

  // Fallback to forwarded headers (works behind proxies)
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "glace-ops-portal.onrender.com";

  return `${proto}://${host}`.replace(/\/$/, "");
}
