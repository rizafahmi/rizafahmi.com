/**
 * The weekly refresh workflow is the only thing that ever writes
 * src/_data/youtube.json in anger, and nothing else exercises it — a mistake
 * here surfaces as a silent weekly rebuild, a churning tracked file, or a hung
 * job holding `contents: write`, none of which fail anything visibly.
 *
 * js-yaml is present in node_modules but only transitively, so these read the
 * file as text rather than taking a dependency the project has not declared.
 * The one piece of real logic in the file — the timestamp-stripping comparison
 * — is pulled out and executed, so this tests the code that actually ships
 * rather than asserting that a string is present.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const WORKFLOW = ".github/workflows/youtube-stats.yml";
const yaml = readFileSync(WORKFLOW, "utf8");

/**
 * The body of one named step, from its `- name:` line to the next one.
 *
 * Searching the whole file for a key proves only that the key is somewhere in
 * it: `YOUTUBE_HANDLE` on the checkout step, where it does nothing, reads the
 * same as `YOUTUBE_HANDLE` on the step that actually runs the fetch. Placement
 * is the entire point of these assertions, so they have to be scoped.
 */
function step(name) {
  const chunks = yaml.split(/^ *- name: /m).slice(1);
  const chunk = chunks.find((c) => c.startsWith(name));
  assert.ok(chunk, `the workflow should have a step named "${name}"`);
  return chunk;
}

/** Everything before the first step, i.e. `jobs:` and the job's own keys. */
function jobHeader() {
  return yaml.split(/^ *steps:$/m)[0];
}

/** The `node -e '...'` program the commit step uses to drop `updatedAt`. */
function stripTimestampProgram() {
  const match = step("Commit if the numbers moved").match(/node -e '([^']*)'/);
  assert.ok(match, "the commit step should strip updatedAt with an inline node program");
  return match[1];
}

function strip(payload) {
  return execFileSync("node", ["-e", stripTimestampProgram()], {
    input: JSON.stringify(payload),
    encoding: "utf8",
  });
}

const PAYLOAD = {
  stats: { subscribers: 7170 },
  momentum: { videosLast12Months: 137 },
  updatedAt: "2026-08-27T14:29:41.430Z",
};

test("the commit guard ignores updatedAt, so a timestamp-only run does not commit", () => {
  // Before this, updatedAt was stamped unconditionally and `git diff --quiet`
  // was therefore never quiet: every weekly run committed and triggered a
  // Netlify rebuild whether or not a single published figure had moved.
  const before = strip(PAYLOAD);
  const after = strip({ ...PAYLOAD, updatedAt: "2026-09-03T14:31:02.000Z" });
  assert.equal(before, after, "only the timestamp moved, so there is nothing to commit");
});

test("the commit guard still sees a real change in the figures", () => {
  const before = strip(PAYLOAD);
  const after = strip({
    ...PAYLOAD,
    momentum: { videosLast12Months: 141 },
    updatedAt: "2026-09-03T14:31:02.000Z",
  });
  assert.notEqual(before, after, "a moved figure must still commit and rebuild");
});

test("the commit guard no longer relies on a bare git diff", () => {
  assert.doesNotMatch(
    step("Commit if the numbers moved"),
    /git diff --quiet HEAD -- src\/_data\/youtube\.json/,
    "a raw diff can never be quiet while updatedAt is stamped every run",
  );
  assert.match(
    step("Commit if the numbers moved"),
    /echo "No change\."/,
    "the skip path must survive",
  );
});

test("the fetch step pins YOUTUBE_HANDLE, so channel.handle does not flip in CI", () => {
  // .envrc sets it locally; without it here CI writes `"handle": null` and the
  // tracked file churns between the two on every run. It has to be on the step
  // that runs the fetch -- anywhere else in the file it is inert.
  const fetchStep = step("Fetch stats");
  assert.match(fetchStep, /^\s+YOUTUBE_HANDLE: rizafahmi$/m);
  assert.match(fetchStep, /^\s+YOUTUBE_CHANNEL_ID:/m, "and the channel id alongside it");
  assert.match(fetchStep, /pnpm run fetch:youtube/, "this really is the step that fetches");
});

test("the job cannot hang for the 360-minute default while holding contents: write", () => {
  // A job-level key, so it must appear above `steps:` -- inside a step it is
  // not a valid timeout and would silently leave the 360-minute default.
  assert.match(jobHeader(), /^\s+timeout-minutes: 10$/m);
});
