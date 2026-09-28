# Christian's Advent

A Next.js / TypeScript website and installable web app, sharing private Advent calendars with Familiator’s Spring Boot API. A Christian's Advent user does not need a Familiator household.

See [architecture and Familiator audit](docs/architecture.md) for the implemented scope, data model, security boundaries and next slices.

## Local development

Requires Node 24 and the existing Familiator API. No `.env` file is needed or created.

```sh
npm ci
aws sso login --profile agile-dev
npm run dev
```

`npm run dev` loads `christiansadvent-local` from AWS Secrets Manager into the child process, then listens on `127.0.0.1:3004`. Override `APP_SECRET_ID`, `AWS_PROFILE`, and `AWS_REGION` when using a different named secret/lane. The secret is provisioned in Agile Dev (878021512734), us-east-1. Values are not printed or saved to disk.

Required secret shape (dummy values, replace before use):

```json
{
  "AUTH0_DOMAIN": "SAME-TENANT-AS-FAMILIATOR-IN-THIS-LANE.us.auth0.com",
  "AUTH0_CLIENT_ID": "MIKES-ADVENT-WEB-CLIENT-ID",
  "AUTH0_CLIENT_SECRET": "MIKES-ADVENT-WEB-CLIENT-SECRET",
  "AUTH0_SECRET": "REPLACE-WITH-64-RANDOM-HEX-CHARACTERS",
  "AUTH0_AUDIENCE": "EXACT-EXISTING-FAMILIATOR-API-IDENTIFIER",
  "APP_URL": "http://localhost:3004",
  "API_URL": "http://localhost:8080"
}
```

Use a **separate Regular Web Application** for Christian's Advent, connected to the **same user directory and API audience** as Familiator in the same lane. Local callback: `http://localhost:3004/auth/callback`; allowed logout URL/web origin: `http://localhost:3004`. Production equivalents use `https://mikesadvent.com`. Register actual Dev/Test/Stage origins separately. Client secret is server-only. No duplicate Auth0 account or identity migration is needed. Confirm the directory’s signup policy; do not enable public signup on the existing connection without reviewing all apps that use it.

Production injects these same values from AWS Secrets Manager into the hosting process. Database credentials stay exclusively in the API; Christian's Advent has none. The Dockerfile builds a standalone Next.js server and does not require secrets at build time.

For a **public-layout preview only**, `npm run dev:configured` starts Next without the secret loader. Missing Auth0 configuration deliberately returns 503 for calendar/login/API routes. There is no development authentication bypass.

The API’s new migration is `V19__advent_calendars.sql`. Use the existing Familiator migrator configuration; do not change it to runtime credentials or run the API locally casually against an unintended database. This development pass tested it on isolated H2 only. For local cross-app authoring, set Familiator web’s server configuration `MIKES_ADVENT_URL` to `http://localhost:3004/calendar`.

## Checks

```sh
npm run typecheck
npm test
npm run build
npm run test:ui
```

Browser tests require a Playwright Chromium installation (`npx playwright install chromium` if missing) and local ports 3104/3105. They launch a mock-API component harness and the production build. Run build first. The harness is under `tests/preview`, outside the production Next.js `app` routes; it does not provide an authentication bypass in the shipped app.

## Human review

1. Confirm same-directory Auth0 clients and populated Secrets Manager entries.
2. Start the API with its normal approved local/Dev migration setup, then both web apps.
3. Sign in to Christian's Advent with a new identity. Create a calendar; confirm it did not create a household.
4. For a readable demonstration before December, choose last year. Create a current-year calendar separately to verify locked doors. The server has no preview-date override.
5. Edit a door, unpublish it, verify it is unavailable to a guest, then republish it. Confirm conflict feedback when saving a stale version.
6. Create a code, join with a second real identity and a name, then revoke their membership. Check that person can no longer retrieve the calendar.
7. Sign into Familiator with the same identity; open **Advent calendars**. Confirm the calendar and read state are shared, without exposing the host’s household.
8. Install on phone home screens. Offline currently shows a reconnect notice; private calendar content is intentionally not cached yet.

Familiator’s new reader can be browser-tested with `npm run test:e2e -- --config playwright.advent.config.ts` from that repository, without starting an API or accessing AWS. The existing full browser runner was also repaired to use an isolated H2 test profile.

No code has been committed/pushed or deployed. Auth0, S3 art uploads, email delivery, purchases, print exports and native Advent screens remain follow-up work.

### Christian’s Advent non-production setup

- Auth0 regular web application: `Christian's Advent Non-Prod`, client ID `aUlUWtIctnNhZNlbnQF5Mo5wsgJwgagd`.
- Tenant: `dev-zpo6vq8c2061d51q.us.auth0.com`; shared Familiator audience: `https://api.familiator.com` (an identifier, not the local backend URL).
- Uses the same `Username-Password-Authentication` connection as Familiator Web Non-Prod.
- `christiansadvent-local` in Agile Dev / us-east-1 holds all seven settings listed above, including the actual client credential and a generated session secret.
- Local app: `http://localhost:3004`; API: `http://local.api.familiator.com:8083`. Both localhost and 127.0.0.1 callbacks/logout origins are registered.
- Start/restart the Familiator API with the `local` profile after applying its local OIDC change. Its existing AWS secret now enables `familiator.local-oidc=true` and supplies the matching issuer/audience. The development shared-token authentication remains available when that option is absent/false; tests retain it by default.
- Refresh tokens rotate, with 30-day idle and 90-day maximum lifetimes. Shared API access tokens expire after one hour.
- Deployed Dev/Test/Stage callback hostnames and per-lane secrets remain pending hostname/deployment configuration. Do not reuse the localhost URLs in a deployed lane.

### Independent public launch

Christian’s Advent currently shows no Familiator promotions or frontend links. Deploy the shared Familiator API independently and configure this app’s production `API_URL`, Auth0 client, issuer and audience in AWS Secrets Manager. Familiator’s frontend does not need to be public for Advent to operate. Restore cross-promotion only when Familiator launches.
