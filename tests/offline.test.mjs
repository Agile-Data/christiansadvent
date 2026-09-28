import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

test("offline worker does not intercept auth or private API traffic", () => {
  const handlers = {};
  vm.runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
    URL, self: { location: { origin: "https://mikesadvent.com" }, addEventListener: (type, handler) => handlers[type] = handler },
  });
  for (const path of ["/auth/login", "/auth/callback", "/api/v1/advent/calendars"]) {
    let intercepted = false;
    handlers.fetch({ request: { method: "GET", url: "https://mikesadvent.com" + path, mode: "navigate" }, respondWith: () => { intercepted = true; } });
    assert.equal(intercepted, false, path);
  }
});

test("failed private navigation serves only the public offline notice", async () => {
  const handlers = {}, matched = [];
  vm.runInNewContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), {
    URL, self: { location: { origin: "https://mikesadvent.com" }, addEventListener: (type, handler) => handlers[type] = handler },
    fetch: async () => { throw new Error("offline"); }, caches: { match: async path => { matched.push(path); return "public notice"; } },
  });
  let response;
  handlers.fetch({ request: { method: "GET", url: "https://mikesadvent.com/calendar", mode: "navigate" }, respondWith: promise => { response = promise; } });
  assert.equal(await response, "public notice");
  assert.deepEqual(matched, ["/offline.html"]);
});
