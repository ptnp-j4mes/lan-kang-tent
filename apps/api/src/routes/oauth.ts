import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { prisma } from "@ckt/db";
import { JWT_SECRET } from "../lib/auth";

const API_URL = process.env.API_URL ?? "http://localhost:4100";
const WEB = process.env.WEB_ORIGIN ?? "http://localhost:3100";

type Provider = {
  id?: string;
  secret?: string;
  auth: string;
  token: string;
  scope: string;
  userinfo: string;
  parse: (u: any) => { email?: string; name?: string; avatar?: string };
};

const PROVIDERS: Record<string, Provider> = {
  google: {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    auth: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    parse: (u) => ({ email: u.email, name: u.name, avatar: u.picture }),
  },
  facebook: {
    id: process.env.FACEBOOK_CLIENT_ID,
    secret: process.env.FACEBOOK_CLIENT_SECRET,
    auth: "https://www.facebook.com/v19.0/dialog/oauth",
    token: "https://graph.facebook.com/v19.0/oauth/access_token",
    scope: "email public_profile",
    userinfo: "https://graph.facebook.com/me?fields=id,name,email,picture",
    parse: (u) => ({ email: u.email, name: u.name, avatar: u.picture?.data?.url }),
  },
};

const redirectUri = (p: string) => `${API_URL}/api/auth/oauth/${p}/callback`;
const back = (q: string) => Response.redirect(`${WEB}/auth/callback?${q}`, 302);

function getCookie(header: string | undefined, name: string) {
  return header?.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="))?.slice(name.length + 1);
}

export const oauthRoutes = new Elysia({ prefix: "/api/auth/oauth" })
  .use(jwt({ name: "jwt", secret: JWT_SECRET, exp: "7d" }))
  // step 1: redirect to provider
  .get("/:provider", ({ params, set }) => {
    const p = PROVIDERS[params.provider];
    if (!p) return back("error=unknown_provider");
    if (!p.id || !p.secret) return back(`error=${params.provider}_not_configured`);
    const state = crypto.randomUUID();
    set.headers["set-cookie"] = `oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`;
    const q = new URLSearchParams({
      client_id: p.id,
      redirect_uri: redirectUri(params.provider),
      response_type: "code",
      scope: p.scope,
      state,
    });
    return Response.redirect(`${p.auth}?${q}`, 302);
  })
  // step 2: callback — verify state, exchange code, upsert user, issue JWT
  .get("/:provider/callback", async ({ params, query, headers, jwt }) => {
    const p = PROVIDERS[params.provider];
    if (!p?.id || !p.secret) return back("error=not_configured");
    if (!query.code || !query.state) return back("error=missing_code");
    if (query.state !== getCookie(headers.cookie, "oauth_state")) return back("error=bad_state");

    try {
      // exchange code → access_token
      let accessToken: string;
      if (params.provider === "google") {
        const r = await fetch(p.token, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: String(query.code),
            client_id: p.id,
            client_secret: p.secret,
            redirect_uri: redirectUri(params.provider),
            grant_type: "authorization_code",
          }),
        }).then((x) => x.json());
        accessToken = r.access_token;
      } else {
        const q = new URLSearchParams({
          code: String(query.code),
          client_id: p.id,
          client_secret: p.secret,
          redirect_uri: redirectUri(params.provider),
        });
        const r = await fetch(`${p.token}?${q}`).then((x) => x.json());
        accessToken = r.access_token;
      }
      if (!accessToken) return back("error=token_exchange_failed");

      // fetch userinfo
      const sep = p.userinfo.includes("?") ? "&" : "?";
      const raw = await fetch(`${p.userinfo}${params.provider === "facebook" ? `${sep}access_token=${accessToken}` : ""}`, {
        headers: params.provider === "google" ? { Authorization: `Bearer ${accessToken}` } : {},
      }).then((x) => x.json());
      const info = p.parse(raw);
      if (!info.email) return back("error=no_email");

      // upsert by email (link social to existing account)
      const user = await prisma.user.upsert({
        where: { email: info.email },
        update: { avatarUrl: info.avatar ?? undefined },
        create: { email: info.email, name: info.name ?? info.email.split("@")[0], avatarUrl: info.avatar },
        select: { id: true, status: true },
      });
      if (user.status !== "active") return back("error=account_suspended");

      const token = await jwt.sign({ sub: user.id });
      return back(`token=${token}`);
    } catch {
      return back("error=oauth_failed");
    }
  });
