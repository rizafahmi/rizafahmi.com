# Consultation page at `/konsultasi/`

**Date:** 2026-08-28
**Status:** Approved design, ready for implementation planning

## Problem

Software engineering is changing faster than the people doing it can absorb, and the
engineering leads watching it happen have no one to think it through with. That is a real
problem worth being paid to solve, and this site currently offers no way to ask.

It is also, today, an **unvalidated bet**. Nobody has asked Riza for this service — paid or
unpaid. That fact shapes every decision below. The page is not a brochure for an established
practice; it is the cheapest instrument that can tell us whether the practice should exist.

Three constraints follow from it:

- **No invented proof.** There are no clients, so there are no logos, no testimonials, and no
  case studies. Anything on the page that implies otherwise is a lie that a single discovery
  call would expose.
- **No offer architecture we have no evidence for.** No retainer tiers, no packages, no
  productised ladder. One-off sessions only.
- **The page must produce interpretable data**, including when the answer is "no". A silent
  page that cannot distinguish "nobody wants this" from "the contact route was broken" has
  cost real time and taught nothing.

## Goals

- Give an engineering lead a reason to start a conversation, and a low-friction way to do it.
- Position honestly: sell judgment from someone doing the work in public, not certainty about
  a future nobody can see.
- Capture enough structure in the inbound to learn *who* asks, *what* they need, and *what
  they would pay* — without publishing a price.
- Ship inside the site's existing design system, performance budget, and test conventions.
- Make the bet falsifiable, with a stated threshold and a decision attached to it.

## Non-goals

- **No prices on the page.** Decided deliberately. Needs vary too much between a five-person
  team and a fifty-person one to publish a number before a single session has been sold. The
  budget band on the brief form is how we recover the data this would otherwise cost us. See
  Risks.
- **No retainer.** Rob Conery's `/advisory/` — the reference for this page — sells $6,000 and
  $10,000 monthly retainers. That model is backed by ten years at Microsoft doing this exact
  work for money. We are backed by a bet, and a monthly retainer is a recurring time
  commitment on top of Hacktiv8, YouTube, and this site. One-off sessions only. The trigger
  that reopens the question is the second buyer asking for something ongoing.
- **No dependency on `/kelas/`.** The course landing page (PR #170) is unmerged and may never
  ship. Nothing on this page links to it, mentions it, or assumes it exists — a link to an
  unbuilt page would fail `scripts/audit-site.mjs` on the broken-internal-link check anyway.
- **No client logos or testimonials.** There are none. See Problem.
- **No second audience.** Individual developers and non-technical businesses are explicitly
  out of scope. See The buyer.
- **No new webfont face and no third-party script.** See Performance.
- **No published kill threshold.** `/kelas/` publishes "50 orang dalam 30 hari" because the
  course does not exist and the threshold *is* the honest pitch. Consultation exists and can be
  delivered next Monday, so "I will take this page down if nobody bites" would only unsettle a
  corporate buyer. The threshold lives in this document instead.

## The buyer

**An engineering lead or CTO of an Indonesian tech team with 5–50 engineers.**

Three candidate buyers were considered and two were cut. The decisive filter was not
willingness to pay — it was **reachability**. This page has no advertising budget, so its only
traffic is the YouTube channel, the blog, and search. That reaches Indonesian developers and
the people who lead them, and nobody else.

| | Reach from this site | Pays for a session | Existing proof convinces them | Price-by-request works |
| --- | --- | --- | --- | --- |
| Individual developers | Excellent | Weak | Yes | **No** |
| Non-technical businesses | **None** | Highest | No | Yes |
| **Engineering lead / CTO** | **Good** | **Yes** | **Strongly** | **Yes** |

**Why individual developers are out.** They are the closest audience and the easiest to reach,
but the price band that audience bears is roughly two orders of magnitude below a consulting
session, and price-by-request guarantees they never make contact — an individual will not email
for a quote. Their version of this need is served by scalable content, not by one-to-one time.

**Why non-technical businesses are out.** Highest willingness to pay, and completely
unreachable by this instrument: they do not read developer blogs or watch Indonesian developer
YouTube. That buyer arrives through referral and LinkedIn, which is a different machine, not a
page. The credibility assets here are all developer-facing and would not convince them.

**Why the engineering lead is in.** Reachable through the existing audience and the Hacktiv8
network. A team of ten engineers adopting AI badly is burning real money, so a session is a
rounding error against the waste. Price-by-request is normal procurement behaviour for them
rather than a barrier. And the strongest credibility asset on hand — co-founding a bootcamp
that trained thousands of engineers — speaks directly to someone whose problem is their team's
skill.

**Why 5–50.** Below five engineers there is no process problem expensive enough to pay to fix.
Above fifty there is usually a platform or enablement team that owns this. Five to fifty is the
band where AI adoption is chaotic and exactly one person is accountable for it.

## Positioning

The hook and the purchase trigger are different things, and the page carries both.

**The hook** is the honest thesis: the profession is changing and nobody knows what it becomes.
Riza does not claim to either. The difference is that he is running the experiment in public
every Monday, on a real codebase, where anyone can watch it fail. That is a cheaper-to-verify
kind of proof than a consultant's biography, and it is true today.

**The purchase trigger** is the concrete form that question takes for an engineering lead right
now: the team already uses AI coding tools, pull requests are multiplying, review is slowing
down, juniors are shipping code they cannot explain, and nobody is sure the team is actually
better off. Nobody wires money for a philosophical question. They wire money for that.

The hero states the thesis, then turns immediately to the concrete version. Draft copy for the
two load-bearing lines:

> **Profesi ini sedang berubah, dan belum ada yang benar-benar tahu jadi apa.**
> Saya juga tidak. Bedanya, saya mengerjakannya di depan umum tiap Senin.
>
> Yang harus kamu putuskan bulan ini jauh lebih konkret: tim kamu sudah pakai AI coding tool,
> PR makin banyak, review makin lambat — dan kamu belum yakin timnya jadi lebih baik.

Tone follows Conery's anti-sales register and the existing `/kelas/` "Jujur dari awal" voice:
specific, unhyped, willing to say what is not being offered. Copy is Indonesian throughout.
Site chrome and `<html lang="id">` are already correct for this page, so no `pageLocale` or
`alternates` work is needed.

## Page structure

One page at `/konsultasi/`, in this order.

1. **Hero** — thesis, the concrete turn, and a CTA anchoring to the brief form.
2. **Tiga bentuk sesi** — the three session types, one short paragraph each. Named by the
   question they answer, never by the buyer segment, so a lead self-selects without being
   labelled:

   | Session | The question it answers | What they walk out with |
   | --- | --- | --- |
   | **Arah** | "Kami baru coba-coba. Mulai dari mana?" | Three things worth doing this quarter, and what to ignore |
   | **Pendapat kedua** | "Rencananya sudah ada — standardisasi tool, rebuild, hire vs training. Tahan nggak?" | A verdict, plus the failure modes not yet hit |
   | **Review cara kerja** | "Lihat cara tim kami benar-benar kerja." | What is broken in the repo, the agent rules files, and the PR flow |

3. **Kenapa saya** — facts only, in this order of relevance to the buyer: Co-Founder Hacktiv8
   (trained thousands of engineers — the single most relevant fact for someone whose problem is
   their team's skill), fourteen years building and teaching software, the weekly *Eksperimen
   Pemrograman* livestream as visible work rather than slides, and a link to
   `/topik/agentic-coding/` so the thinking can be judged for free before anything is paid for.
4. **Jujur dari awal** — the honesty block, in the `/kelas/` voice: this is a new service, there
   are no clients yet, certainty is not on offer, pricing is per case because a five-person team
   and a fifty-person team are not the same problem, and if the session concludes they do not
   need him, he says so.
5. **Bukan untuk siapa** — one short paragraph. Individual developers who are not leading a team
   are pointed at `/topik/agentic-coding/` and the livestream. This protects the niche without
   sending anyone away empty-handed, and it must not reference `/kelas/`.
6. **Ajukan brief** — the form. See below.
7. **FAQ** — five entries: how pricing works and when a number arrives; what a session is not
   (no implementation work, no ongoing retainer); whether it can be done remotely and in what
   language; what happens if he is the wrong person for the problem; and what a team should
   prepare beforehand.

## The brief form

Netlify Forms, native HTML, no JavaScript. Posts to `/konsultasi/terima-kasih/`.

| Field | Type | Required | Purpose |
| --- | --- | --- | --- |
| `nama` | text | No | — |
| `email` | email | **Yes** | Only hard requirement. The `email` name is load-bearing: Netlify uses it to set the Reply-To header, so replies go straight to the sender from a normal mail client |
| `perusahaan` | text | No | A company name is the cheapest signal that this is a team and not a solo developer |
| `tim` | select — `<5` / `5–15` / `16–50` / `>50` | Yes | The niche check. Out-of-band answers are kept rather than blocked; they are data about who actually shows up |
| `situasi` | textarea | **Yes** | The real qualifier. A serious lead writes three sentences; a tire-kicker writes five words |
| `sesi` | select — arah / pendapat kedua / review / belum tahu | Yes | Which of the three session types has demand |
| `budget` | select — `<Rp2jt` / `Rp2–5jt` / `Rp5–10jt` / `>Rp10jt` / **`Belum tahu`** | Yes | Recovers the willingness-to-pay signal that price-by-request would otherwise destroy |
| `kapan` | select — minggu ini / bulan ini / masih riset | Yes | Urgency, and it separates a buyer from a browser |

Plus the Netlify plumbing: a hidden `form-name` input whose value matches the `<form name>`
attribute, `netlify-honeypot="bot-field"` with its visually hidden labelled input, and a hidden
`subject` field (`Brief konsultasi — rizafahmi.com`) so the notification mail is filterable.

Two deliberate decisions in that table:

**`budget` is required but carries a "Belum tahu" option.** A required budget field with no
escape hatch is a known conversion killer on first-contact forms; making it optional loses the
data entirely. A required select with an honest opt-out gets an answer from everyone and blocks
nobody. The opt-out is itself signal: if most briefs choose it, the market has no price anchor
for this service, and the next move is to publish one.

**Field styling lives in `assets/konsultasi.css`.** The unmerged `/kelas/` branch inlines
`style="..."` on every input; that is not repeated here, and the repo has no form styles on
`main` to inherit, so these rules are written fresh.

### Thank-you page

`/konsultasi/terima-kasih/` sets the expectation that makes price-by-request survivable:

> Brief kamu masuk. Saya balas dalam 1×24 jam kerja dengan angka dan usulan bentuk sesi.

Only promise a turnaround that will actually be held. If 1×24 hours is not realistic, the copy
says 2×24 instead — a missed self-imposed SLA on first contact costs more than the slower
promise would have.

## Notifications and verification

A probe that collects briefs nobody reads is the worst available outcome, so notification setup
is part of the work, not an afterthought.

- **Enable email notifications** at `Project configuration → Notifications → Emails and
  webhooks → Form submission notifications`. Mail arrives from `formresponses@netlify.com`.
- **Notifications fire only for verified submissions.** Anything the spam filter catches is
  dropped silently. At an expected volume of roughly five briefs, one false positive is twenty
  percent of the dataset — so the Forms dashboard's spam bucket gets a weekly check while volume
  is low.
- **Submit the form once after deploy, confirm the email arrives, then delete the test
  submission.** Without this, a "zero briefs" result is uninterpretable and could kill an offer
  whose only real defect was a broken pipe.
- **Cost.** Netlify made form submissions free and unlimited on credit-based plans in April
  2026. The legacy 100-per-month cap applies only to accounts still on a legacy plan; worth one
  glance at billing, though at this volume the distinction is academic.

## Implementation

| File | Change |
| --- | --- |
| `src/konsultasi.njk` | New. `layout: main`, `permalink: /konsultasi/`, `pageCss: konsultasi.css`, `title`, `description`; `data-pagefind-body` on `<main>` |
| `src/konsultasi-terima-kasih.njk` | New. `permalink: /konsultasi/terima-kasih/`. Flat filename, nested permalink — the convention the unmerged `/kelas/` branch also uses |
| `assets/konsultasi.css` | New. Section rules, session cards, form fields |
| `src/_includes/main.njk` | Add `Konsultasi` to the hero nav (5 → 6 items) |
| `src/index.njk` | Add a `#konsultasi` body section |
| `scripts/audit-site.mjs` | Add `/konsultasi` to the homepage-reachability list |
| `test/konsultasi.test.js` | New. See Testing |

**One template, no `_body.njk` partial.** `kerjasama_body.njk` exists because that page renders
macros over fetched YouTube data. This page is static prose plus a form, so a partial would be
indirection with nothing behind it. Split only if the template passes roughly 250 lines.

**The homepage gets a body section, not a ninth nav item.** `src/index.njk` already carries
eight nav entries (`Catatan, Mulai, Topik, Tips, Karya, Kerjasama, Kontak, Cari`), and a ninth
sitting next to the visually similar "Kerjasama" would degrade the whole nav. The homepage
already uses in-body sections with anchors for `#karya` and `#kontak`; `#konsultasi` follows
that pattern and converts better than a nav link would. `main.njk` still gets the nav entry.

**CSS reuses what exists.** CTAs use the global `.button` class (already sharp-cornered, mono,
acid-on-hover, with its dark-mode variant). `konsultasi.css` carries only what is genuinely new:
the `h2` top-border section rule matching `kerjasama.css`, the three session cards, and the form
fields. Flat borders, sharp corners, no shadows or gradients — `DESIGN.md` is unchanged.

**Search.** `data-pagefind-body` on `<main>`. Pagefind runs in opt-in mode on this site, so the
page is invisible to search without it. The page has an `<h1>`, so no `data-pagefind-meta` is
required.

## Testing

`test/konsultasi.test.js`, asserting the failures that would otherwise be silent:

1. **Both site navs reach the page.** `src/_includes/main.njk` contains the link, and — when a
   build is present — `dist/index.html` renders an anchor to `/konsultasi/`. This site has
   several separate page chromes, each owning its own `<head>` and nav, and shipped `/tips`
   unreachable from the homepage once already; `test/tips-nav.test.js` documents that history.
2. **`form-name` matches `<form name>`.** The highest-value assertion on the page. A mismatch
   makes Netlify drop submissions silently, manufacturing exactly the false negative this design
   exists to prevent.
3. **`/konsultasi/terima-kasih/` is actually built.** `scripts/audit-site.mjs` checks `<a href>`
   links but not `<form action>`, so a converted lead landing on a 404 is a gap nothing
   currently catches.
4. **`data-pagefind-body` is present** on the page's `<main>`.
5. **The `budget` select still carries its "Belum tahu" option**, so the conversion decision
   above cannot be quietly removed by a later edit.

`scripts/audit-site.mjs` covers the rest through its existing SEO, frontmatter, sitemap, and
broken-internal-link checks once `/konsultasi` is added to the homepage-reachability list.

Note in passing, not to be acted on here: `test/tips-nav.test.js` is really a site-nav integrity
test rather than a tips test, and its `CHROMES` map will want extracting the next time a third
page needs it. Not this change.

## Performance

Nothing lands on the critical path. No new webfont face, so the five-face budget in
`src/libs/webfonts.js` is untouched; no third-party origin; no JavaScript, because the form is
native HTML posting to Netlify. The page should clear the site's Lighthouse ≥ 92 and LCP < 1.8s
bar without special handling. `pageCss` keeps `konsultasi.css` off every other page.

## Success criteria and the kill decision

Measured over **60 days** from the distribution step below, not from deploy.

A **qualified brief** is one where `tim` is 5–15 or 16–50, `situasi` runs longer than a single
line, and `budget` is not "Belum tahu".

Rows are evaluated top to bottom; the first one that matches decides.

| Outcome after 60 days | Reading | Next move |
| --- | --- | --- |
| ≥ 1 paid session | The offer is real | Publish a price. Reopen the retainer question if the buyer asks for something ongoing |
| 0 paid, ≥ 5 qualified briefs | Wanted, but priced or trusted wrong | Publish a number and remove the quote step |
| 0 paid, ≥ 5 briefs but < 5 qualified | The page reaches the wrong reader | Check who is arriving in the `tim` and `budget` answers before touching anything else |
| < 5 briefs total | The page is not the problem — distribution is | Do not rewrite the page. Go back to the list below, or stop |

The last row is the one to hold to honestly. The failure mode this design most needs to avoid
is responding to silence by rewriting copy, because copy is almost never what is wrong when a
page with no traffic produces no leads.

## Distribution

**The page is not the experiment. Sending it is.**

Nothing on this site currently reaches an engineering lead on the day they are deciding how
their team should work with AI. Publishing `/konsultasi/` and waiting will return zero briefs,
and that zero will mean nothing.

So the page ships with a dated companion step: **within one week of deploy, twenty named
engineering leads from the Hacktiv8 alumni network and the wider Indonesian ecosystem are
messaged directly with the link.** Alumni who graduated between 2016 and 2020 are leads and CTOs
now; that is a warm list, and it is the only part of this plan that is not a bet.

This step is recorded here because a design that lets the page substitute for the conversations
would be optimising the wrong thing. Twenty messages will teach more in a week than the page
will in sixty days, and the page exists to give those messages somewhere to point.

## Risks

**Price-by-request suppresses volume.** It is the correct posture for a corporate buyer and the
wrong one for everyone else, which is part of why the niche narrowed to corporate buyers. The
`budget` band is the mitigation: the page stays quiet about price while the form still reports
what the market would pay. If the "Belum tahu" share is high, that is the signal to publish a
number.

**Sixty days is a long feedback loop for five data points.** Accepted deliberately: the
alternative — publishing a price with no evidence — sets an anchor that is harder to move later
than it is to set now.

**The distribution step is the single point of failure.** Every other risk here is recoverable
by editing a file. This one is not, and it is outside the repository.

**The honesty block could read as inexperience to a corporate buyer.** Judged worth it. Conery's
page runs the same play — "if the map says you don't need me after that, I'll tell you" — and
the alternative is manufacturing proof that a first call would demolish.
