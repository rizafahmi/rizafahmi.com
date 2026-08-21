import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile("src/now.njk", "utf8");

// The captain stopped being an AWS Community Builder in July 2026. The whole
// point of the removal is that the claim must not come back on a later edit.
test("the now page no longer claims a retired credential", () => {
  assert.doesNotMatch(source, /AWS Community Builder/i);
});

test("the now page still lists the credential that is current", () => {
  assert.match(source, /Google Developer Expert \(GDE\)/);
});

// A /now page whose own stamp is stale undercuts the premise of the page.
test("the now page carries a hand-maintained last-updated stamp", () => {
  assert.match(source, /Terakhir diperbarui: [A-Z][a-z]+ \d{4}/);
});
