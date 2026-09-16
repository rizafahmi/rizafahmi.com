import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import kit from "../src/_data/vibeCoding.js";
import { kitSections, renderKitPdf } from "../src/libs/vibe-coding.js";

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
  assert.doesNotMatch(prompt, /professional app builder/i);
  assert.doesNotMatch(prompt, /creative strategist/i);
  assert.doesNotMatch(prompt, /high-quality/i);
  assert.match(prompt, /Understand the problem/);
  assert.match(prompt, /hypothes/i);
  assert.match(prompt, /untested/i);
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

test("the private offer uses a Netlify form and states reply window, agenda, and setup rule", () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  assert.match(source, /<form\b/);
  assert.doesNotMatch(source, /mailto:/);
  assert.doesNotMatch(source, /lewat email/i);
  assert.doesNotMatch(source, /kirim email/i);
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
  assert.doesNotMatch(source, /bukan jasa pembuatan aplikasi/);
  assert.match(source, /Saya memakai emailmu/);
  assert.doesNotMatch(source, /Tanpa newsletter, tanpa diteruskan/);
  assert.doesNotMatch(source, /segera mengirimkan/);
  assert.match(source, /Saya cek persiapan/);
  assert.match(source, /One-on-one/);
  assert.doesNotMatch(source, /1-on-1|1x24/);
  assert.equal(kit.emailHref, undefined);
  assert.equal(kit.email, undefined);
});

test("the hidden form-name input matches the form's name attribute", () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  const formName = source.match(/<form[^>]*\sname="([^"]+)"/)?.[1];
  const hidden = source.match(/name="form-name"[^>]*value="([^"]+)"/)?.[1];
  assert.ok(formName, "no <form name=...> found");
  assert.ok(hidden, "no hidden form-name input found");
  assert.equal(hidden, formName);
  assert.equal(formName, "vibe-coding-private");
});

test("the form action points at a page that is actually built", () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  const action = source.match(/<form[^>]*\saction="([^"]+)"/)?.[1];
  assert.ok(action, "no <form action=...> found");

  const target = readFileSync("src/vibe-coding-private-terima-kasih.njk", "utf8");
  const frontmatter = target.split("---")[1] ?? "";
  assert.match(frontmatter, new RegExp(`^permalink: ${action}$`, "m"));
  assert.match(frontmatter, /^noindex: true$/m);
  assert.match(target, /lewat email/);
});

test('the form declares data-netlify="true"', () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  const form = source.match(/<form[\s\S]*?>/)?.[0];
  assert.ok(form, "no <form ...> found");
  assert.match(form, /data-netlify="true"/);
});

test("the honeypot is declared and paired with a matching input", () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  const form = source.match(/<form[\s\S]*?>/)?.[0];
  assert.ok(form, "no <form ...> found");
  assert.match(form, /netlify-honeypot="bot-field"/);
  assert.match(source, /<input[^>]*\sname="bot-field"/);
});

test("a field named email exists", () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  assert.match(source, /<input[^>]*\sname="email"/);
});

test("the brief form only asks for nama, email, and cerita", () => {
  const source = readFileSync("src/vibe-coding-private.njk", "utf8");
  const form = source.match(/<form[\s\S]*?<\/form>/)?.[0];
  assert.ok(form, "no form found");
  const names = [...form.matchAll(/<(?:input|textarea)[^>]*\sname="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    names.filter((name) => !["form-name", "subject", "bot-field"].includes(name)),
    ["nama", "email", "cerita"],
  );
  assert.match(form, /<textarea[^>]*\sname="cerita"[^>]*required/);
  assert.doesNotMatch(form, /name="tujuan"|name="mentok"|name="pengalaman"|name="tautan"/);
});

test("kitSections preserves all prompts, examples, and handoff checks verbatim", () => {
  const sections = kitSections(kit);
  const serialized = JSON.stringify(sections);
  const steps = kit.stages.flatMap((stage) => stage.steps);
  assert.equal(steps.length, 12);
  assert.equal(new Set(steps.map((step) => step.id)).size, 12);
  for (const step of steps) {
    assert.ok(serialized.includes(JSON.stringify(step.prompt)), step.id);
    assert.ok(serialized.includes(JSON.stringify(step.examplePrompt)), step.id);
    assert.doesNotMatch(step.examplePrompt, /\[[^\]]+\]/, step.id);
    assert.ok(serialized.includes(step.check), step.id);
    assert.ok(serialized.includes(step.next), step.id);
  }
  assert.doesNotMatch(serialized, /Rp\s*[\d.]|rupiah|IDR\s*\d/i);
  assert.match(serialized, new RegExp(kit.responseTime));
  assert.doesNotMatch(serialized, /rizafahmi@gmail\.com/);
  assert.doesNotMatch(serialized, /lewat email/i);
});

test("renderKitPdf returns a PDF without a public fee", async () => {
  const pdf = await renderKitPdf(kit);
  assert.ok(Buffer.isBuffer(pdf));
  assert.equal(pdf.subarray(0, 5).toString("utf8"), "%PDF-");
  assert.doesNotMatch(pdf.toString("latin1"), /Rp\s*[\d.]|rupiah|IDR\s*\d/i);
});

const kitCopyStrings = () => {
  const parts = [
    kit.title,
    kit.subtitle,
    kit.description,
    kit.updated,
    kit.responseTime,
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
  for (const section of kitSections(kit)) {
    for (const value of Object.values(section)) {
      if (typeof value === "string") assert.doesNotMatch(value, /;/);
      if (Array.isArray(value)) {
        for (const item of value) assert.doesNotMatch(item, /;/);
      }
    }
  }
  for (const file of ["src/vibe-coding.njk", "src/vibe-coding-private.njk"]) {
    assert.doesNotMatch(readFileSync(file, "utf8"), /;/, file);
  }
  const guide = readFileSync("src/vibe-coding.njk", "utf8");
  assert.match(guide, /Unduh semua prompt \(PDF\)/);
  assert.match(guide, /\/vibe-coding\/panduan\.pdf/);
  assert.match(guide, /01–12/);
  assert.match(guide, /Riza Fahmi · Panduan Vibe Coding/);
  assert.match(guide, /menulis panduan ini/);
  assert.match(guide, /Mulai dari SlideQR/);
  assert.match(guide, /Sesi privat/);
  assert.doesNotMatch(guide, /Ingin dipandu/);
  assert.doesNotMatch(guide, /Mulai dari hal sederhana/);
  assert.doesNotMatch(guide, /tatap muka/);
  assert.doesNotMatch(guide, /Panduan ditulis oleh/);
  assert.doesNotMatch(guide, /Riza Fahmi \/ /);
  assert.doesNotMatch(guide, /panduan\.md|Unduh semua prompt \(Markdown\)/);
  const hosting = kit.prerequisites.find((item) => item.title.includes("Hosting"));
  assert.match(hosting.text, /Model Context Protocol \(MCP\)/);
  assert.equal(kit.glossary.at(-1).term, "Deploy and document root");
  assert.doesNotMatch(kit.stages[2].steps[0].prompt, /trustworthy/i);
  assert.doesNotMatch(kit.stages[3].steps[0].prompt, /beginner-friendly/i);
  assert.ok(kitSections(kit).some((section) => section.text === "Sesi privat 90 menit"));
  assert.doesNotMatch(JSON.stringify(kitSections(kit)), /Butuh pendampingan/);
});

test("clipboard fallback names the text instead of pointing above", () => {
  const source = readFileSync("assets/vibe-coding.js", "utf8");
  assert.match(source, /Pilih teksnya/);
  assert.doesNotMatch(source, /di atas/);
  assert.doesNotMatch(source, /kit-email-fallback/);
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

test("built pages expose the guide, working copy targets, PDF download, and Netlify form", {
  skip: !existsSync("dist/vibe-coding/index.html") && "Run pnpm run build first",
}, () => {
  const html = readFileSync("dist/vibe-coding/index.html", "utf8");
  const privateHtml = readFileSync("dist/vibe-coding/private/index.html", "utf8");
  const thankYou = readFileSync("dist/vibe-coding/private/terima-kasih/index.html", "utf8");
  const download = readFileSync("dist/vibe-coding/panduan.pdf");
  assert.equal(download.subarray(0, 5).toString("utf8"), "%PDF-");
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
  assert.match(html, /\/vibe-coding\/panduan\.pdf/);
  assert.doesNotMatch(html, /Starter Kit|starter panduan/i);
  assert.doesNotMatch(html, /panduan\.md/);
  assert.doesNotMatch(privateHtml, /mailto:/);
  assert.match(privateHtml, /<form[^>]*name="vibe-coding-private"/);
  assert.match(privateHtml, /data-netlify="true"/);
  assert.match(thankYou, /lewat email/);
  assert.match(readFileSync("dist/index.html", "utf8"), /href="\/vibe-coding\/"/);
});
