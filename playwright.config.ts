import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests", testMatch: "*.spec.ts", fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:3104", headless: true },
  webServer: [{ command: "node node_modules/next/dist/bin/next dev tests/preview --webpack --hostname 127.0.0.1 --port 3104", url: "http://127.0.0.1:3104", reuseExistingServer: false },
    { command: "node scripts/start.mjs", url: "http://127.0.0.1:3105", reuseExistingServer: false,
      env: { PORT: "3105", HOSTNAME: "127.0.0.1", AUTH0_DOMAIN: "", AUTH0_CLIENT_ID: "", AUTH0_CLIENT_SECRET: "", AUTH0_SECRET: "", AUTH0_AUDIENCE: "", APP_URL: "" } },
  ],
});
