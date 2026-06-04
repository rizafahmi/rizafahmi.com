---
name: rizafahmi.com
description: Personal website, blog, and portfolio of Riza Fahmi
colors:
  neutral-light-bg: "#ffffff"
  neutral-light-text: "#292626"
  neutral-light-heading: "#211a1e"
  neutral-dark-bg: "#0f1115"
  neutral-dark-text: "#e6e6e6"
  neutral-dark-heading: "#f5f5f5"
  accent-sky: "#7dd3fc"
  accent-charcoal: "#211a1e"
typography:
  display:
    fontFamily: "Wotfard, Futura, -apple-system, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1.2
  body:
    fontFamily: "Wotfard, Futura, -apple-system, sans-serif"
    fontSize: "1rem"
    lineHeight: "1.5rem"
  mono:
    fontFamily: "JetBrainsMono, monospace"
    fontSize: "0.9rem"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  pill: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent-charcoal}"
    textColor: "#fcfcfc"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1rem"
  button-pill:
    backgroundColor: "{colors.neutral-dark-bg}"
    textColor: "{colors.neutral-dark-text}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
---

# Design System: rizafahmi.com

## 1. Overview

**Creative North Star: "The Minimalist Foundry"**

A design system that combines technical monospaced precision with clean, spacious, and highly readable editorial typography. It serves as the visual wrapper for Riza Fahmi's writing, programming notes (specifically Elixir and AI), and portfolio. The interface deliberately prioritizes editorial space, structure, and text legibility, avoiding generic tech clichés such as neon green-on-black or unnecessary glassmorphism overlays.

### Key Characteristics
- **Editorial Contrast**: Big, bold display headings paired with clean, readable body copy.
- **Developer Accents**: Monospaced font keys, inline tags, and custom typewriter effects for tech-oriented content.
- **Intended Dark-First**: Defaulting to low-light comfort while preserving clean light/dark toggles.
- **Refined Neutrality**: A monochromatic foundation tinted slightly toward Slate/Charcoal to keep colors harmonious.

## 2. Colors

A Restrained Monochromatic color palette with functional Sky Blue accents (in dark mode) or Deep Charcoal accents (in light mode) to preserve text hierarchy and readability.

### Primary
- **Accent Charcoal** (`#211a1e`): Used as the primary button background, focus outline, and text accent in light mode.
- **Accent Sky** (`#7dd3fc`): Used for hyperlinks, tags, and interactive hover states in dark mode.

### Neutral
- **Light Background** (`#ffffff`): Canonical white canvas for light mode reading.
- **Light Body Text** (`#292626` / `rgb(41, 38, 38)`): Low-strain dark grey body copy.
- **Dark Background** (`#0f1115`): Low-glare dark canvas for comfortable reading at night.
- **Dark Body Text** (`#e6e6e6`): High-contrast light grey text that prevents eye strain.
- **Meta Color** (`rgba(33, 26, 30, 0.6)` / `rgba(230, 230, 230, 0.7)`): Secondary metadata and secondary text.

### Named Rules
**The Content Contrast Rule.** Text links must always maintain at least 4.5:1 contrast against their background. Accent colors are reserved for interactive elements (links, buttons, tags) and must cover less than 10% of any page layout to maintain structural hierarchy.

## 3. Typography

**Display Font:** Wotfard (with Futura, -apple-system, sans-serif fallback)
**Body Font:** Wotfard (with Futura, -apple-system, sans-serif fallback)
**Label/Mono Font:** JetBrainsMono (with monospace fallback)

### Hierarchy
- **Display** (Extra Bold 900, `2.25rem`, Line-height `1.2`): Page titles, section headings, major callouts.
- **Headline** (Bold 800, `1.5rem`, Line-height `1.25`): Article titles, secondary section headings.
- **Body** (Regular, `1rem`, Line-height `1.5rem`): Paragraph body text, lists. Body text line length is capped at a maximum of `65-75ch` in article views to prevent line-wrapping fatigue.
- **Label** (Regular / Bold, `0.875rem` / `0.9rem`): Metadata, table headers, breadcrumbs, inline tags.

### Named Rules
**The Editorial Width Rule.** Article body blocks (`.container` wrapper) must never exceed a maximum width of `720px` to keep line lengths short, scannable, and comfortable.

## 4. Elevation

The design system utilizes a flat-by-default visual approach. Depth is conveyed using clear background container shifts (e.g. darker neutral cards on light/dark backgrounds) and border divisions rather than decorative drop shadows.

### Named Rules
**The Flat Elevation Rule.** Containers, badges, cards, and input fields remain visually flat at rest. Interactive states such as hover, focus, and active triggers communicate change via subtle scale, background color transitions, or underline transitions rather than shadow offsets.

## 5. Components

### Buttons
- **Shape:** Rounded corners (sm: `0.25rem` / `4px`)
- **Primary:** Dark background (`var(--button-bg)`), white text (`var(--button-text)`), padding `0.75rem 1rem`, transition `background-color 0.3s ease`.
- **Navigation Pill:** Large rounded pill (`2rem`), background `var(--nav-btn-bg)`, text `var(--nav-btn-text)`. Interactive hover state shifts to hover-background (`var(--nav-btn-hover-bg)`) and hover-text (`var(--nav-btn-hover-text)`).

### Cards
- **Shape:** Soft rounded corners (md: `0.5rem` / `8px`)
- **Structure:** Flat container with light background fill (`#f5f5f5` in light mode, `#2b2f38` in dark mode). Title, description, and meta category tags are stacked vertically. Nesting cards is strictly prohibited.

### Links
- **Article Link:** Text link uses `text-decoration: underline` with a high offset (`text-underline-offset: 0.18em`) to prevent overlapping text elements, and no border-bottom.
- **Hero/Nav Link:** Flat hover with no underlines, transitioning backgrounds or text color.

## 6. Do's and Don'ts

### Do's
- Do use `JetBrainsMono` for all inline code blocks and typewriter-like accents.
- Do keep the body line length strictly under `75ch` for article pages.
- Do ensure the light/dark theme switchers transition colors smoothly using `transition: background-color 0.3s ease, color 0.3s ease`.

### Don'ts
- Don't use bright neon backgrounds or text colors; keep neutrals tinted for comfort.
- Don't use decorative drop shadows or complex gradients as structural accents.
- Don't use side-stripe borders as card accents.
- Don't nest cards inside each other.
