# Dynamic YouTube Media Kit at `/kerjasama/`

**Date:** 2026-08-27
**Status:** Approved design, ready for implementation planning

## Problem

`/kerjasama/` (`src/ratecard.njk`) is the site's only inbound page for sponsorship and
collaboration leads. Three things are wrong with it.

**The stats are stale and nothing refreshes them.** The page reads `src/_data/youtube.json`,
which `scripts/fetch-youtube-stats.mjs` produces. That script is referenced nowhere — not in
`package.json`, not in `netlify.toml`, and the repository has no `.github/` directory at all.
It was run by hand once. `youtube.json` carries `updatedAt: 2026-02-09`, roughly six and a
half months stale. The page claims 6.880 subscribers and 322.729 views; the channel is at
7.170 and 364.431.

**The one performance metric it publishes is its weakest number.** `avgViewsLast12` is a mean
across the twelve most recent uploads regardless of age or format. Videos published days ago
sit at 0 views and drag the mean down; a single breakout Short pulls it up. The page currently
tells a sponsor "209 average views, range 0–400", which understates the channel and invites
exactly the skepticism it is meant to disarm.

**It is unsearchable.** The page has no `data-pagefind-body`, and Pagefind runs in opt-in mode
on this site, so it is silently excluded from the search index.

## Goals

- Publish YouTube numbers that are current, honest, and as strong as the data legitimately allows.
- Make the refresh automatic so the page cannot rot again.
- Render it in the site's own design system rather than as a foreign artifact.
- Keep it indexable and tested.

## Non-goals

- **No prices.** The Canva deck ("Rate Card v2") carries starting prices; the page does not.
  Pricing stays by-request over email. This is a media kit, not a price list.
- **No Instagram or X follower counts.** Neither platform is on the page, with or without
  numbers. Automatic collection was evaluated and rejected on evidence, measured 2026-08-27:
  `instagram.com/rizafahmi/` returns a 616 KB login-walled JS shell with zero `og:` meta tags
  and no follower field; `x.com/rizafahmi22` returns a client-side shell with nothing
  server-rendered; and the legacy `cdn.syndication.twimg.com/widgets/followbutton/info.json`
  endpoint answers 200 with an empty body. Any scraper would also run from GitHub Actions
  datacenter IPs, which both platforms block first — producing a collector that fails silently
  and leaves wrong figures on a page shown to sponsors. The sanctioned alternatives are the
  Instagram Graph API (Business account, linked Facebook Page, and a token expiring every 60
  days) and the X API (user lookup is paid-tier only). Neither is worth its maintenance for a
  single slow-moving number, and 4,5rb IG followers at 0,5% engagement would weaken the page
  beside 7.170 subscribers and 364.431 views.
- **No separate Ngobrolin WEB channel stats.** Ngobrolin WEB is a format within YouTube and is
  measured with YouTube data, not as a standalone channel with its own metrics.
- **No Narasumber/Acara (speaking) section.** Removed from this page entirely.
- **No visual borrowing from the Canva deck.** The deck is a content reference only. Its
  purple/yellow palette is not ported; `DESIGN.md` governs.

## The data, as of 2026-08-27

Measured from the channel statistics endpoint and the last 150 uploads
(2025-06-11 through 2026-08-26).

| Metric | Value |
| --- | --- |
| Subscribers | 7.170 |
| Total views | 364.431 |
| Total videos | 846 |
| Videos published, last 12 months | 138 |
| Views on that 12-month cohort | 49.664 |
| Upload cadence | ~10,6 per month |

Cadence by month shows a hard ramp: 2 (Aug 2025) → 27 (Jun 2026), 28 (Jul 2026), 20 (Aug 2026).

Per format, over videos at least 21 days old (n = 133 of 150):

| Format | n | Median | p25–p75 | Max |
| --- | --- | --- | --- | --- |
| Livestream/Episode | 79 | 253 | 193–384 | 755 |
| Shorts | 53 | 273 | 139–614 | 2.406 |
| Recorded video | 1 | — | — | 161 |

Ngobrolin WEB specifically: 59 mature episodes, median 243, range 109–575.

The ten highest-performing recent videos are all Shorts. Eight of the top nine are AI and
agentic-coding topics published May–Jul 2026 (1.700, 1.574, 1.298, 1.198, 1.143, 1.096, 941,
915); the single highest, 2.406, is a Sep 2025 clip on a different topic. All-time channel
ceiling is 29.060 (Ainun Najib, 2020).

Note the `recorded` bucket holds exactly one video in this window. See "Small-sample
suppression" below.

The honest pitch these numbers support: a niche Indonesian developer audience, output tripled
since May 2026, and a format that is currently working. Not a large channel.

## Page structure

Rewrite `src/ratecard.njk` in place. `permalink: /kerjasama/` is unchanged.

1. **Hero** — title, one-line positioning naming the audience (developer Indonesia), email CTA.
2. **Kredibilitas** — konten sejak 2012, podcast sejak 2015, komunitas sejak 2014.
3. **Jangkauan** *(auto)* — subscribers, total views, total videos.
4. **Momentum** *(auto)* — 12-month video count, 12-month cohort views, uploads per month.
5. **Format & performa** *(auto)* — median views per format, each shown with its sample size
   and range. Never a single blended average.
6. **Ngobrolin WEB** *(auto)* — episode count and consistency band, framed as a title-sponsorable
   recurring series.
7. **Video terbaik** — curated list, titles and view counts hydrated from fetched data.
8. **Pernah dipercaya** — AWS Indonesia, BenQ Indonesia, Meta/Facebook, Google Indonesia,
   Domainesia, Niagahoster, Feedloop, DeepTech. Rendered as square-edged wordmark cards; the
   repository contains no logo assets for these brands, and none are to be added.
9. **Deliverables** — recorded video, Shorts, community post, pre-stream sponsorship, placement
   ads, shoutout ads, amplifier (X/LinkedIn). No prices.
10. **Request kerjasama** — the existing mailto with its prefilled brief template.

Every number sourced from `youtube.json` is rendered next to, or under, a visible `updatedAt`
date.

## Data architecture

### `scripts/fetch-youtube-stats.mjs` (rewritten)

Walks the uploads playlist and fetches full video records for the most recent 150 uploads —
three `playlistItems` calls plus three `videos` calls. Emits an extended `src/_data/youtube.json`:

- `channel` — id, title, url, handle, thumbnail (unchanged shape)
- `stats` — `subscribers`, `totalViews`, `videoCount`
- `momentum` — `videosLast12Months`, `viewsLast12Months`, `uploadsPerMonth`, `byMonth`
- `formats` — for each of `shorts`, `episode`, `recorded`: `n`, `median`, `p25`, `p75`, `min`, `max`
- `ngobrolinWeb` — `episodes`, `median`, `min`, `max`
- `topVideos` — top performers with id, title, url, views, publishedAt
- `recentVideos` — unchanged shape
- `updatedAt`, `source`

`avgViewsLast12` and `viewsLast12Range` are removed from the emitted shape and from the template.

### Computation rules

- **Maturity filter.** Videos younger than 21 days are excluded from every median, percentile,
  and range. They are still counted in `momentum.videosLast12Months` and in cadence, because
  those measure output rather than performance.
- **Median, not mean**, for all per-format performance figures.
- **Format bucketing**, in this order: duration ≤ 180s → `shorts`; else `liveStreamingDetails`
  present or duration ≥ 2700s → `episode`; else → `recorded`.
- **Ngobrolin WEB** is identified by case-insensitive `"ngobrolin"` in the video title.
- **Uploads per month** is `videosLast12Months` divided by the number of distinct calendar
  months present in that cohort, rounded to one decimal.
- **Small-sample suppression.** A format bucket with fewer than 5 mature videos does not get a
  median rendered; the section omits that format rather than publishing a one-sample "median".
  This is not hypothetical — as of 2026-08-27 the `recorded` bucket holds a single video, so
  the page will show Shorts and Livestream/Episode only. The threshold lives in
  `src/libs/youtube-stats.js` as a named constant, and the bucket is still emitted to
  `youtube.json` with its `n` so the suppression is a render decision, not data loss.

### `src/libs/youtube-stats.js` (new)

The pure functions — `parseDuration`, `bucketFormat`, `isMature`, `summarize`, `momentumFrom` —
live here so they are unit-testable without network access. The script imports them; it keeps
only fetching and file writing.

### `src/_data/ratecardBestVideos.json`

Stays curated — the selection is a human judgment. Entries drop their hardcoded `title` and keep
`{ id, tag }` only. Title and view count are hydrated at build time from the video records in
`youtube.json`, so a curated entry can no longer display a stale title or go silently missing.
Curated ids not present in the fetched window are dropped from render rather than shown blank.

### Graceful degradation

The template guards on the presence of `youtube.stats.subscribers` as it does today. With no
data file, or an incomplete one, the page renders its static sections and shows a plain notice
in place of the statistics rather than emitting empty markup or crashing the build.

## Refresh mechanism

`.github/workflows/youtube-stats.yml` — new, and the repository's first workflow.

- Triggers: weekly `schedule` cron, plus `workflow_dispatch` for manual runs.
- Steps: checkout → setup Node from `.nvmrc` → `corepack enable` → `pnpm install --frozen-lockfile`
  → `pnpm run fetch:youtube` → commit `src/_data/youtube.json` only if it changed.
- Secret `YOUTUBE_API_KEY`; variable `YOUTUBE_CHANNEL_ID` (`UCHhAlFGFCGgIusQkQIqJLYw`).
- The commit triggers the existing Netlify build.

`package.json` gains `"fetch:youtube": "node scripts/fetch-youtube-stats.mjs"` for local runs.

**The build never calls the YouTube API.** `pnpm run build` reads the committed JSON only. This
keeps builds hermetic and offline-capable, and means an API outage, quota exhaustion, or an
expired key can never fail a deploy — it can only leave the numbers where they were.

Because `updatedAt` is rendered on the page, a silently broken workflow is visible rather than
hidden.

## Visual design

Neo-Acid Gallery, per `DESIGN.md`. No new tokens, no new palette.

- Stat figures in brutalist cards: 2px solid border, no radius, no shadow, transparent fill.
- Hover drenches a card in Electric Cobalt with white text, per the existing card convention.
- Major section splits use 4px borders; groups within a section use 2px.
- Numbers set in the display face (Unbounded), labels in Martian Mono.
- Body copy left-aligned and capped at 65ch.
- Sponsor wordmarks as square-edged cards, matching the tactile-pill convention.

### CSS loading

`src/ratecard.njk` uses `layout: main`, and `src/_includes/main.njk` hardcodes its stylesheet
links. Rather than add page-specific rules to `global.css` — which every page on the site pays
for — `main.njk` gains a small optional front-matter hook:

```njk
{% if pageCss %}
  <link rel="preload" as="style" href="/assets/{{ pageCss }}?v={{ site.buildTime }}" type="text/css" media="screen" />
  <link rel="stylesheet" href="/assets/{{ pageCss }}?v={{ site.buildTime }}" type="text/css" media="screen" />
{% endif %}
```

The page sets `pageCss: kerjasama.css`. Pages that do not set it are byte-for-byte unchanged.
New file: `assets/kerjasama.css`.

## Search indexing

The page's `<main>` gets `data-pagefind-body`. Because the indexed region has an `<h1>`, no
`data-pagefind-meta` title override is needed. This makes `/kerjasama/` searchable for the
first time.

## Collateral change

`src/_data/cv.js:347` carries the comment *"Angka diambil dari halaman /kerjasama/
(src/ratecard.njk)."* above its `speaking.tally` of 41 seminars and 19 workshops. That section
is being removed from `/kerjasama/`, so the comment becomes a dangling pointer. `cv.js` holds
its own copy of the numbers and keeps them; only the comment is repointed to state that the CV
is now their source of record. No CV output changes.

## Testing

**`test/youtube-stats.test.js`** (new) — against fixtures, no network:

- `parseDuration` across `PT45S`, `PT19M51S`, `PT1H54M50S`, and malformed input
- `bucketFormat` at the 180s and 2700s boundaries, and that `liveStreamingDetails` forces
  `episode` for a mid-length video
- `isMature` at the 21-day boundary
- median and percentiles on even- and odd-length sets, and on a single-element set
- that a zero-view video published two days ago is excluded from medians but counted in cadence
- that a format bucket with 4 mature videos is suppressed and one with 5 is rendered
- empty input returns a well-formed zero summary rather than `NaN` or a throw

**`test/kerjasama-page.test.js`** (new) — against built output:

- the page builds at `/kerjasama/`
- no `Rp` price string appears anywhere in the rendered output
- `data-pagefind-body` is present
- the rendered subscriber figure matches `youtube.json`
- with statistics absent, the fallback notice renders and no empty stat cards are emitted

`pnpm run check` (Biome + unit tests) and `pnpm run audit:site` must both pass.

## Risks

- **API quota or key rotation.** Contained by design: the build never calls the API, so the
  failure mode is stale numbers with a visible stale date, not a broken site.
- **150-video window.** Medians describe roughly the last fifteen months, not all time. This is
  intended — recent performance is what a sponsor is buying — and the page labels the window.
- **Modest absolute numbers.** Recent per-video medians are in the low hundreds. The design
  answers this with framing rather than inflation: lifetime reach, output momentum, format
  specificity, named past sponsors, and audience niche. No metric is selected purely because it
  flatters, and every average states its sample size and range.
