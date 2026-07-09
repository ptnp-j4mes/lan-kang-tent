// Minimal GA4 Data API client via service-account JWT — no googleapis dep.
// Needs env GA4_SA_CLIENT_EMAIL + GA4_SA_PRIVATE_KEY (the property id comes from
// SiteSettings.ga4PropertyId so admins set it in the UI).
import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

const clientEmail = () => process.env.GA4_SA_CLIENT_EMAIL;
// private key may arrive with literal "\n" (e.g. from a single-line env var)
const privateKey = () => process.env.GA4_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const ga4Configured = () => Boolean(clientEmail() && privateKey());

const b64url = (b: Buffer | string) =>
  Buffer.from(b).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

// cache token across calls within its lifetime
let cached: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const email = clientEmail()!;
  const key = privateKey()!;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const signature = b64url(createSign("RSA-SHA256").update(`${header}.${claim}`).sign(key));
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!res.ok) throw new Error(`GA4 token error: ${res.status} ${await res.text()}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return j.access_token;
}

async function runReport(propertyId: string, body: any) {
  const token = await accessToken();
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GA4 report error: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[] }>;
}

export type TopPage = { path: string; title: string; views: number };
export type SearchTerm = { term: string; views: number };

// top pages by views over the last `days` days
export async function topPages(propertyId: string, days = 28, limit = 20): Promise<TopPage[]> {
  const r = await runReport(propertyId, {
    dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit,
  });
  return (r.rows ?? []).map((row) => ({
    path: row.dimensionValues[0]?.value ?? "",
    title: row.dimensionValues[1]?.value ?? "",
    views: Number(row.metricValues[0]?.value ?? 0),
  }));
}

// site-search terms (only populated if site search tracking is enabled in GA4)
export async function topSearchTerms(propertyId: string, days = 28, limit = 20): Promise<SearchTerm[]> {
  try {
    const r = await runReport(propertyId, {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "searchTerm" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    });
    return (r.rows ?? [])
      .map((row) => ({ term: row.dimensionValues[0]?.value ?? "", views: Number(row.metricValues[0]?.value ?? 0) }))
      .filter((t) => t.term && t.term !== "(not set)");
  } catch {
    return []; // dimension may be unavailable — non-fatal
  }
}
