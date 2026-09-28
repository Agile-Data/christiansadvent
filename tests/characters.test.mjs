import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const catalog = JSON.parse(readFileSync(new URL("../lib/characters/catalog.json", import.meta.url)));
test("character views remain inside their versioned master and include the complete cast", () => {
  assert.equal(Object.keys(catalog.characters).length, 14);
  for (const c of Object.values(catalog.characters)) {
    const asset = catalog.assets[c.asset];
    assert.ok(c.views[c.defaultView]);
    for (const r of Object.values(c.views)) {
      assert.ok(r.x >= 0 && r.y >= 0 && r.width > 0 && r.height > 0);
      assert.ok(r.x + r.width <= asset.width);
      assert.ok(r.y + r.height <= asset.height);
    }
  }
  assert.equal(catalog.characters.mike.label, "Mike");
  assert.equal(catalog.characters.christian.label, "Christian");
});
