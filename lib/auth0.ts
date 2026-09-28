import { Auth0Client } from "@auth0/nextjs-auth0/server";
let client: Auth0Client | undefined;
export function configured() {
  return ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "AUTH0_SECRET", "AUTH0_AUDIENCE", "APP_URL"].every(key => Boolean(process.env[key]));
}
export function auth0() {
  if (!configured()) throw new Error("Sign-in is not configured");
  return client ??= new Auth0Client({
    domain: process.env.AUTH0_DOMAIN!, clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!, secret: process.env.AUTH0_SECRET!,
    appBaseUrl: process.env.APP_URL!, signInReturnToPath: "/calendar",
    authorizationParameters: { audience: process.env.AUTH0_AUDIENCE!, scope: "openid profile email offline_access" },
    enableAccessTokenEndpoint: false,
    session: { cookie: { name: "mikesadvent_session" } },
  });
}
