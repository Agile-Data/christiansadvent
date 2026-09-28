import { expect, test } from "@playwright/test";
const origin = "http://127.0.0.1:3105";
test("public landing is usable on mobile while unconfigured private routes fail closed", async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  await expect(page.getByRole("heading", { name: "One little door. Traditions that bring us together." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/landing-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: "test-results/landing-desktop.png", fullPage: true });
  for (const path of ["/calendar", "/api/v1/advent/calendars", "/auth/login"]) {
    const response = await request.get(origin + path);
    expect(response.status()).toBe(503);
    expect(response.headers()["cache-control"]).toBe("no-store");
  }
  const manifest = await request.get(origin + "/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({ start_url: "/calendar", display: "standalone" });
});
