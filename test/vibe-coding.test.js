import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import kit from "../src/_data/vibeCoding.js";
import { renderKitMarkdown } from "../src/libs/vibe-coding.js";

test("both kit pages opt into Pagefind and declare their routes", () => {
  for (const [file, permalink] of [
    ["src/vibe-coding.njk", "/vibe-coding/"],
    ["src/vibe-coding-private.njk", "/vibe-coding/private/"],
  ]) {
    const source = readFileSync(file, "utf8");
    const frontmatter = source.split("---")[1] ?? "";
    assert.match(source, /data-pagefind-body/, file);
    assert.match(frontmatter, new RegExp(`^permalink: ${permalink}$`, "m"), file);
    assert.match(frontmatter, /^pageCss: vibe-coding\.css$/m, file);
    assert.match(frontmatter, /^layout: main$/m, file);
  }
});

test("the shared chrome nav links to /vibe-coding/", () => {
  const source = readFileSync("src/_includes/main.njk", "utf8");
  assert.match(source, /<a href="\/vibe-coding\/">/);
});

test("prompt 01 keeps brainstorming claims tentative", () => {
  const prompt = kit.stages[0].steps[0].prompt;
  const idea = kit.stages[0].steps[0].example.IDE_APLIKASI;
  assert.doesNotMatch(prompt, /succeed in today's market/i);
  assert.doesNotMatch(prompt, /Get real understanding/i);
  assert.match(prompt, /Understand the problem/);
  assert.match(prompt, /hypothes/i);
  assert.match(idea, /presenter who needs to share a URL/i);
  assert.doesNotMatch(idea, /\bfancy\b/i);
});

test("deployment prompts inspect before publishing and refuse secrets", () => {
  const steps = Object.fromEntries(
    kit.stages.find((stage) => stage.id === "deploy").steps.map((step) => [step.id, step]),
  );
  assert.match(steps.koneksi.prompt, /read-only/i);
  assert.match(steps.unggah.prompt, /\.env/);
  assert.match(steps.unggah.prompt, /tokens/i);
});

test("the private offer is email-only and states reply window, agenda, and setup rule", () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  assert.doesNotMatch(source, /<form\b/);
  assert.equal(kit.responseTime, "24 jam kerja");
  assert.match(source, /vibeCoding\.responseTime/);
  assert.match(source, /15 menit/);
  assert.match(source, /60 menit/);
  assert.match(source, /setup menjadi target/);
  assert.match(source, /sesi instalasi/);
  assert.match(source, /cofounder HACKTIV8/);
  assert.doesNotMatch(source, /Co-Founder/);
  assert.match(source, /Kita sepakati targetnya/);
  assert.match(source, /Sesi ini pendampingan belajar/);
  assert.match(source, /Saya memakai emailmu/);
  assert.match(source, /Saya cek persiapan/);
  assert.match(source, /One-on-one/);
  assert.doesNotMatch(source, /1-on-1|1x24/);
});

test("download preserves all prompts, examples, and handoff checks verbatim", () => {
  const markdown = renderKitMarkdown(kit);
  const steps = kit.stages.flatMap((stage) => stage.steps);
  assert.equal(steps.length, 12);
  assert.equal(new Set(steps.map((step) => step.id)).size, 12);
  for (const step of steps) {
    assert.ok(markdown.includes(`\n${step.prompt}\n`), step.id);
    assert.ok(markdown.includes(`\n${step.examplePrompt}\n`), step.id);
    assert.doesNotMatch(step.examplePrompt, /\[[^\]]+\]/, step.id);
    assert.ok(markdown.includes(step.check), step.id);
    assert.ok(markdown.includes(step.next), step.id);
  }
  assert.doesNotMatch(markdown, /Rp\s*[\d.]|rupiah|IDR\s*\d/i);
  assert.match(markdown, new RegExp(kit.responseTime));
});

test("email CTA encodes an editable brief, without a fee or booking commitment", () => {
  const url = new URL(kit.emailHref);
  const body = url.searchParams.get("body");
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, kit.email);
  assert.equal(url.searchParams.get("subject"), "Sesi Privat Vibe Coding");
  assert.match(body, /Project atau tujuan saya:\n/);
  assert.match(body, /Yang sudah saya coba, atau bagian yang membuat saya mentok:/);
  assert.doesNotMatch(body, / \/ /);
  assert.doesNotMatch(body, /Rp\s*[\d.]|rupiah|IDR\s*\d/i);
});

const kitCopyStrings = () => {
  const parts = [
    kit.title,
    kit.subtitle,
    kit.description,
    kit.updated,
    kit.responseTime,
    decodeURIComponent(new URL(kit.emailHref).searchParams.get("body")),
    ...kit.prerequisites.flatMap((item) => [item.title, item.text]),
    ...kit.howTo,
    ...kit.glossary.flatMap((item) => [item.term, item.meaning]),
    ...kit.sources.map((source) => source.label),
  ];
  for (const stage of kit.stages) {
    parts.push(stage.title, stage.description);
    for (const step of stage.steps) {
      parts.push(
        step.title,
        step.tool,
        step.input,
        step.prompt,
        step.output,
        step.check,
        step.next,
        ...Object.values(step.example),
      );
    }
  }
  return parts;
};

test("kit copy has no semicolons and names MCP, Markdown, and the author in active voice", () => {
  for (const part of kitCopyStrings()) {
    assert.doesNotMatch(part, /;/, part.slice(0, 120));
  }
  assert.doesNotMatch(renderKitMarkdown(kit), /;/);
  for (const file of ["src/vibe-coding.njk", "src/vibe-coding-private.njk"]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /;/, file);
  }
  const guide = readFileSync("src/vibe-coding.njk", "utf8");
  assert.match(guide, /Unduh semua prompt \(Markdown\)/);
  assert.match(guide, /File Markdown/);
  assert.match(guide, /01–12/);
  assert.match(guide, /Riza Fahmi · Panduan Vibe Coding/);
  assert.match(guide, /menulis panduan ini/);
  assert.doesNotMatch(guide, /Panduan ditulis oleh/);
  assert.doesNotMatch(guide, /Riza Fahmi \/ /);
  const hosting = kit.prerequisites.find((item) => item.title.includes("Hosting"));
  assert.match(hosting.text, /Model Context Protocol \(MCP\)/);
  assert.equal(kit.glossary.at(-1).term, "Deploy and document root");
});

test("clipboard fallback names the text instead of pointing above", () => {
  const source = readFileSync("assets/vibe-coding.js", "utf8");
  assert.match(source, /Pilih teksnya/);
  assert.doesNotMatch(source, /di atas/);
});

const copyHarness = (writeText, count) => {
  let listener;
  const status = { textContent: "" };
  const button = {
    hidden: true,
    dataset: { copyTarget: "prompt", copyEvent: "kit-copy-rencana-custom" },
    addEventListener: (_event, callback) => {
      listener = callback;
    },
    closest: () => ({ querySelector: () => status }),
  };
  vm.runInNewContext(readFileSync("assets/vibe-coding.js", "utf8"), {
    document: {
      querySelectorAll: () => [button],
      getElementById: () => ({ textContent: "  Prompt\nbaris kedua  " }),
    },
    navigator: { clipboard: { writeText } },
    window: { goatcounter: { count } },
  });
  return { button, status, click: () => listener() };
};

test("copy reports success only after clipboard resolves, independent of analytics", async () => {
  let finish;
  let copied;
  const harness = copyHarness(
    (text) => {
      copied = text;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
    () => {
      throw new Error("Analytics blocked");
    },
  );
  const pending = harness.click();
  assert.equal(harness.button.disabled, true);
  assert.equal(harness.status.textContent, "");
  finish();
  await pending;
  assert.equal(copied, "Prompt\nbaris kedua");
  assert.equal(harness.status.textContent, "Tersalin. Siap ditempel.");
  assert.equal(harness.button.disabled, false);
});

test("clipboard rejection preserves manual fallback and records no success event", async () => {
  let events = 0;
  const harness = copyHarness(
    async () => {
      throw new Error("Permission denied");
    },
    () => {
      events++;
    },
  );
  await harness.click();
  assert.match(harness.status.textContent, /Belum tersalin.*manual/);
  assert.equal(harness.button.disabled, false);
  assert.equal(events, 0);
});

test("built pages expose the guide, working copy targets, and an email-only offer", {
  skip: !existsSync("dist/vibe-coding/index.html") && "Run pnpm run build first",
}, () => {
  const html = readFileSync("dist/vibe-coding/index.html", "utf8");
  const privateHtml = readFileSync("dist/vibe-coding/private/index.html", "utf8");
  const download = readFileSync("dist/vibe-coding/panduan.md", "utf8");
  assert.equal(download, renderKitMarkdown(kit));
  for (const page of [html, privateHtml]) {
    assert.match(page, /data-pagefind-body/);
    assert.doesNotMatch(page, /Rp\s*[\d.]|rupiah|IDR\s*\d/i);
    for (const [, id] of page.matchAll(/data-copy-target="([^"]+)"/g)) {
      assert.ok(page.includes(`id="${id}"`), id);
    }
  }
  assert.equal([...html.matchAll(/data-copy-target=/g)].length, 24);
  assert.match(html, /<pre[^>]+lang="en"/);
  assert.match(html, /Panduan Vibe Coding/);
  assert.doesNotMatch(html, /Starter Kit|starter panduan/i);
  assert.match(privateHtml, /mailto:rizafahmi@gmail\.com\?subject=/);
  assert.doesNotMatch(privateHtml, /<form\b/);
  assert.match(readFileSync("dist/index.html", "utf8"), /href="\/vibe-coding\/"/);
});
