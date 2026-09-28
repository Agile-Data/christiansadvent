# Advent Universal Login

`universal-login.html` is the published non-production template. It overrides the logo
and favicon only for Christian's Advent client `aUlUWtIctnNhZNlbnQF5Mo5wsgJwgagd`.
Other clients retain the tenant branding. Published and visually verified on 2026-09-27 through login-dev.agiledatasys.com. No pre-existing template was present.

Before future updates, retrieve and back up the existing tenant template and merge
this conditional into it instead of overwriting unrelated customizations.

Migration order:
1. Authorize the official Auth0 CLI for the non-production tenant.
2. Review existing template and Google/Apple provider callback registrations.
   Custom-domain provider callback: https://login-dev.agiledatasys.com/login/callback
3. Publish and verify the app-specific template through the custom domain.
4. Add `familiator.additional-issuers` = `https://login-dev.agiledatasys.com/`
   to the API's local AWS secret, retaining its original primary issuer; restart API.
5. Change AUTH0_DOMAIN in christiansadvent-local to login-dev.agiledatasys.com;
   restart Advent, then verify login and authenticated API access.

Do not change other apps or production secrets as part of this local migration.

Current blocker: Google uses Auth0 development keys (unsupported with custom domains); Apple connection options are empty. The application domain and API AWS secrets have not been changed. Configure provider-owned credentials and the custom-domain callback before steps 4–5. The application logo_uri is saved for Advent consent screens.
