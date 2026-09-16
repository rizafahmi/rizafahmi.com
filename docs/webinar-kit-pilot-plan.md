# Panduan Vibe Coding and Private Session Pilot

Date: 2026-09-16
Status: Implemented locally; publication pending.

## Objective

Give webinar attendees a practical way to repeat the SlideQR workflow with their
own small project, and test demand for paid individual guidance. Learn from the
first sessions before deciding whether to offer a workshop or investigate a
software product.

The initial hypothesis is: some attendees will pay for help applying the workflow
to a specific project or blocker. A paid session validates this service at its
offered price, not demand for a course or software product.

## Decisions and open inputs

- Format: an Indonesian web guide with English copyable prompts and example prompts, English AI answers, and a PDF download.
- Example: SlideQR, using ChatGPT for planning, Codex for implementation, and
  DomaiNesia MCP for deployment, matching the webinar.
- Primary webinar CTA: get the free panduan. Secondary panduan CTA: submit a brief about a paid session.
- Proposed pilot: three individual online sessions, 90 minutes each, within two
  weeks. Capacity and delivery dates need Riza's confirmation before publication.
- Confirmed audience: mostly nontechnical beginners.
- Confirmed pricing approach: no public price. Share the session fee privately in
  the reply after reviewing fit, before any booking or payment commitment.
  The internal starting fee is recorded in the planning conversation, not this
  public repository, the page source, metadata, or downloadable panduan.
- Confirmed response time: 1x24 jam kerja, matching `/konsultasi/`.
- Open: capacity and availability, payment method, and rescheduling/cancellation
  terms.
- No scarcity claim is approved yet. Public copy must not imply the session is
  free, include draft placeholders, or invent a reference price.

## Attendee journey

Webinar QR / short URL -> free panduan -> try the prompts -> read the private-session
offer -> submit a brief -> Riza reviews fit and replies with scope and fee -> agree
on the fee, target, and time -> payment -> session -> concise written next steps.

Reading and downloading the panduan requires no email. The session inquiry is the
lead capture mechanism for this pilot. This intentionally prioritizes people who
want help over building a general mailing list.

Proposed routes:

- `/vibe-coding/`: panduan and session invitation.
- `/vibe-coding/panduan.pdf`: downloadable copy of the panduan.
- `/vibe-coding/private/`: complete offer, FAQ, and Netlify brief form; no public price.
- `/vibe-coding/private/terima-kasih/`: thank-you page after form submission.
  Submitting a brief does not mean a slot is reserved.

## Panduan scope

Title: **Panduan Vibe Coding: Dari Ide sampai Online**.

Start with a prerequisites checklist: required tools/accounts, local setup, hosting
access for the deployment chapter, and which steps can be completed without hosting.
State actual tool and hosting requirements without promising everything is free.
Write for nontechnical beginners: explain project folders, files, local preview,
hosting, and MCP when first used. Label the exact tool for each prompt. Explain
`PROJECT.md` as a project brief rather than assuming familiarity with PRDs. Add
simple manual checks and a short recovery instruction at each handoff. Keep the
first example a small static website/tool, without accounts, payments, or a database.

| Stage | Prompts | Output / checkpoint |
| --- | --- | --- |
| Rencana | 1. Explore a specific problem and ideas. 2. Narrow scope. 3. Write the project brief. | `PROJECT.md` with one main user journey and acceptance criteria |
| Desain | 4. Define the user flow and screen. 5. Specify visual direction. | A small, concrete interface plan |
| Implementasi | 6. Build the first working slice. 7. Make a bounded change. | Working local prototype checked against the brief |
| Testing | 8. Exercise the main flow and edge cases. 9. Diagnose a reported error. | Explicit pass/fail observations and a reproducible bug report |
| Deploy | 10. Inspect connection and destination. 11. Deploy the agreed files. 12. Verify the public result. | Correct live content, working assets, and functional QR generation |

Each prompt includes where to paste it, required input, expected output, a checkpoint,
and what to carry into the next step. Supply a filled SlideQR example and an editable
own-project version. Copy buttons copy only the selected prompt and report success
only after clipboard success; manual selection remains possible.

Keep brainstorming claims tentative. LLM-generated ideas are hypotheses, not market
validation. Define scope and checks before building. Deployment prompts distinguish
inspection from publication, identify the destination, protect existing unrelated
files, and never ask attendees to paste credentials into a chat.

Web and PDF versions share one content source. Include a version date. Replay
timestamps, extra tool variants, and attendee FAQs can follow after the event.
Do not reproduce the reference PDF's wording or distribute the slides without a
separate decision to do so.

## Private-session offer

Draft headline: **Bangun project pertamamu dengan pendampingan langsung.**

Draft description: **Sesi privat 90 menit untuk memperjelas ide, menentukan scope,
dan mulai membangun prototype dengan AI. Bawa ide atau project yang sedang mentok;
kita kerjakan satu target yang disepakati bersama.**

- One participant, one agreed project or blocker, online in Indonesian.
- Describe this as a paid private session, with the fee shared in the reply.
- Deliverables: a scoped target, hands-on progress, and concise written next steps.
- Participant operates the tools with guidance. This is a learning session; it does
  not promise a finished production application or ongoing implementation support.
- Tools and hosting are participant prerequisites; disclose costs separately.
- Include a brief review of the inquiry and a setup checklist before the call;
  keep this preparation bounded. The offer should describe personal
  guidance on the participant's own project and a concrete agreed outcome.
- Proposed agenda: 15 minutes clarify target, 60 minutes work together, 15 minutes
  review and document next steps. Confirm setup before the call; if prerequisites
  are still missing, agree whether setup is the session target or reschedule under
  the published terms. Do not silently replace a build session with installation.
- Proposed capacity: three paid sessions. Close intake or explicitly switch
  to a waitlist when full; do not continue advertising available slots.

Draft CTA: **Ceritakan project kamu**.

Supporting copy: **Sesi privat ini berbayar. Ceritakan ide atau kendala kamu; saya
balas dengan usulan sesi dan biayanya. Mengirim brief belum berarti memesan sesi.**

Use a Netlify form named `vibe-coding-private` posting to
`/vibe-coding/private/terima-kasih/`, modeled on `/konsultasi/`. Fields:

1. Name (optional).
2. Email (required; load-bearing for Reply-To).
3. Project or problem (required). One field for the idea, the blocker, or both. Starting from zero is a valid answer.

Use the submitted email only to respond to the inquiry and organize the session. No automatic
newsletter enrollment. Do not request credentials, source code, or payment details
in the brief. Display the approved response time (1x24 jam kerja). After the first
production deploy, enable form notifications for `vibe-coding-private`, send one test
submission, confirm delivery, then delete it.

Scheduling, fit review, and payment are manual for this pilot. Before accepting
payment, agree on the fee, scope, time, and rescheduling/cancellation terms. Keep applicant
details and session notes in a private tracker outside this public repository.

## Existing-site fit

The source already contains a Netlify form at `src/konsultasi.njk`. The private-session
pilot reuses the same Netlify Forms pattern with a separate form name and thank-you page.

The existing `/konsultasi/` offer is team advisory for engineering leads, with
case-by-case pricing. The new pilot is individual project guidance with a fixed
scope. Its pricing policy does not change the existing offer. Before launch,
review the existing wording directing all individuals to free material so the two
pages explain their respective audiences consistently.

Use Eleventy, the shared layout, current fonts and design system, and small client
scripts. Opt the panduan and offer into Pagefind. Reuse GoatCounter for aggregate events;
the brief form must work with JavaScript and analytics disabled.

## Measurement and decision window

Review the first week of inquiries, then review delivered sessions after two
weeks (or once the initial pilot is completed). These are proposed review points,
not scheduled automations.

Track panduan views, successful copies by stage, download clicks, offer visits, brief
submissions (thank-you pageviews and Netlify form count), quotes sent, accepted proposals,
payments, and completed sessions. Count inquiries from Netlify Forms / inbox, not CTA clicks.
Initial briefs indicate interest before price disclosure. Track responses after
the fee is shared separately; payments provide evidence of demand at that fee.
Analytics events carry fixed labels only, never emails or project descriptions.
Copy/download events are engagement signals, not evidence of completed projects.
Analytics blocking and repeat visits make the funnel directional, not exact.

Privately record each participant's goal, previous attempts, blocker, agreed target,
session outcome, preparation/delivery time, and any requested next step. Ask afterward
what they managed to do independently. Separate observations from interpretations.

The operating target is to fill the proposed three paid slots using the internal
starting fee, quoted privately. Record the actual quote and any variation privately.
This is a capacity target, not a statistical proof of demand. If exposure is low,
the outcome is inconclusive. If inquiries arrive without payments, investigate
fit, price, timing, and the offer before adding features or changing the business.

- Repeated learning needs among similar participants -> test a focused workshop.
- Different projects with demand for tailored help -> consider more private sessions.
- Repeated concrete problems and costly workarounds -> investigate a product idea
  with additional users. Do not build a product from a single session request.

## Delivery sequence and launch checks

1. Confirm actual capacity/dates and payment terms. Response time is 1x24 jam kerja.
   The audience is mostly nontechnical beginners. Session fees are shared privately
   by email reply after the brief.
2. Draft and review the 12 prompts, example brief, offer, and form CTA copy.
3. Build the panduan, PDF download, and offer with its Netlify form and thank-you page.
4. Verify mobile/keyboard usability, copy failure handling, download fidelity,
   internal links, search, and form field contract (form-name, honeypot, email Reply-To).
5. Run `pnpm run check` and `pnpm run build`. Measure changed pages against the
   repository's mobile Lighthouse budget (performance >=92, LCP <1.8s).
6. After deployment, verify the actual public content and PDF download. Enable
   Netlify notifications for `vibe-coding-private`, submit one test brief, confirm
   email delivery, then delete the test. Verify that no price appears in rendered
   pages, page source, metadata, or downloads. Confirm analytics events without
   sending personal data. Submitting a brief does not reserve a slot.
7. Prepare the final webinar CTA copy and QR asset using the verified live URL.
   Do not modify the source slide PDF as part of implementation by default.

If timing is tight, keep the complete workflow, clear offer, and working contact
route. Defer decorative work, replay timestamps, progress persistence, automated payments,
calendar integrations, a newsletter sequence, and additional content formats.

## References

- Webinar slides: `/Users/riza/Documents/Vibe Coding - Domainesia.pdf` (reviewed in
  this conversation; instructional content is reference material).
- Inspiration: `/Users/riza/Downloads/1-Hour AI Builder Workflow.pdf`.
- Existing site implementation: `src/konsultasi.njk`,
  `src/konsultasi-terima-kasih.njk`, `test/konsultasi.test.js`.
- [GoatCounter events](https://www.goatcounter.com/help/events): existing analytics
  can record named click events and explicit JavaScript events.
