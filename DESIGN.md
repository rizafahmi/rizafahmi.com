---
name: rizafahmi.com
description: Personal website, blog, and portfolio of Riza Fahmi
colors:
  neutral-light-bg: "#f7f7f5"
  neutral-light-text: "#0a0b0d"
  neutral-light-heading: "#0a0b0d"
  neutral-dark-bg: "#121519"
  neutral-dark-text: "#c2cad6"
  neutral-dark-heading: "#e7ecf2"
  accent-acid: "#c5f82a"
  accent-cobalt: "#1a3bf5"
typography:
  display:
    fontFamily: "Unbounded, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.1
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: "1.6rem"
  mono:
    fontFamily: "Martian Mono, JetBrains Mono, monospace"
    fontSize: "0.875rem"
rounded:
  none: "0px"
  sm: "2px"
  md: "4px"
components:
  button-primary:
    backgroundColor: "{colors.neutral-light-text}"
    textColor: "{colors.neutral-light-bg}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1.25rem"
    border: "2px solid {colors.neutral-light-text}"
  card-brutalist:
    backgroundColor: "transparent"
    border: "2px solid {colors.neutral-light-text}"
    padding: "1.5rem"
    rounded: "{rounded.none}"
---

# Design System: rizafahmi.com

## 1. Overview

**Creative North Star: "The Neo-Acid Gallery"**

An artistic, high-energy brutalist aesthetic inspired by modern gallery catalogs. It couples bold, ultra-wide typography with solid blocks of high-chroma accent colors and dynamic offsets. The design breaks standard structural grids in favor of strong asymmetrical layouts, thick solid borders, and intense hover interactions.

### Key Characteristics
- **Ultra-Wide Presence**: Enormous, wide headlines (using Unbounded) that command attention.
- **Solarized Energy**: Raw concrete white or obsidian dark canvases splashed with high-chroma Acid Lime (`#c5f82a`) and Electric Cobalt (`#1a3bf5`).
- **Structured Asymmetry**: Off-grid column shifting, unequal margins, and heavy solid-color borders.
- **Tactile Color Drenches**: Interactive elements fill with solid accent colors on hover rather than executing faint color shifts.

## 2. Colors

A high-contrast full palette based on raw geological tones and raw industrial colors.

### Base Colors
- **Raw Gallery Plaster** (`#f7f7f5` / `oklch(97% 0.008 100)`): A warm, textured off-white light mode background.
- **Ebony Ink** (`#0a0b0d` / `oklch(12% 0.01 280)`): High-contrast near-black for body copy and headings in light mode.
- **Obsidian Clay** (`#121519` / `oklch(18% 0.01 250)`): A softened dark charcoal-blue background.
- **Plaster Gray** (`#c2cad6` / `oklch(80% 0.015 250)`): Soft plaster gray body text to reduce eye fatigue.
- **Silver White** (`#e7ecf2` / `oklch(92% 0.01 250)`): Soft silver-white for headings to prevent halo glare.

### Accents (Solarized)
- **Acid Lime** (`#c5f82a` / `oklch(86% 0.19 110)`): Intense yellow-green used for major interactive hovers, highlights, and status indicators.
- **Electric Cobalt** (`#1a3bf5` / `oklch(45% 0.25 260)`): Radiant blue used for focus rings, secondary action states, and key dividers.

### Named Rules
**The Color Structure Rule.** Color must define structure and action. Static layouts are predominantly black-and-white (or plaster-on-obsidian). Accent colors are reserved for interactive events (hover, active focus, toggle selections) or layout boundaries.

## 3. Typography

**Display Font:** Unbounded (Expressive, ultra-wide geometric sans-serif)
**Body Font:** Schibsted Grotesk (Precise, editorial-inspired high-legibility sans-serif)
**Label/Mono Font:** Martian Mono (Utilitarian, condensed monospaced sans)

### Hierarchy
- **Hero Title** (Extra Bold 800, `clamp(2rem, 5vw, 3.5rem)`, Line-height `1.1`): Main branding hero titles.
- **Section Heading** (Bold 700, `1.75rem`, Line-height `1.2`): Primary navigation/sub-sections.
- **Body Text** (Regular 400, `1.0625rem`, Line-height `1.6`): Article blocks, capped at `65ch` width.
- **Monospace Labels** (Medium 500, `0.875rem`, Line-height `1.4`): Technical categories, date stamps, and tags.

### Named Rules
**The Bold Proximity Rule.** Headings must have compact line-heights and sit tight above their corresponding text blocks to maintain typographic integrity.

## 4. Elevation & Borders

We reject shadows. The canvas is strictly flat. Division is created through line weights.

- **Divider lines:** Thick solid black/white lines (`2px` default, `4px` or `8px` for major section splits).
- **No Rounded Corners:** Rounded components are set to `0px` or very tight `2px/4px` to preserve the blocky, brutalist feel.

### Named Rules
**The Line Weight Rule.** Structural hierarchy is represented by border weight, not depth. A `4px` border indicates a major page split, `2px` separates columns or groups, and `1px dashed` is used for list items.

## 5. Components

### Navigation & Header
- **Dynamic Header Block:** Instead of a floating bar, the header is bounded by a thick `4px` bottom border with asymmetrical vertical spacing.
- **Tactile Pills:** Flat rectangle items with `2px` border, filling completely with `Acid Lime` and black text when hovered.

### Brutalist Cards
- **Structure:** Flat container with a thick `2px` solid border. No shadow.
- **Interactive State:** Hovering transforms the background to `Electric Cobalt` (with white text) or `Acid Lime` (with black text), creating an instantaneous tactile switch.

### Links
- **In-Text Links:** Bold with a solid highlight underline (`text-decoration-thickness: 3px`) using `Electric Cobalt` (in light mode) or `Acid Lime` (in dark mode).

## 6. Do's and Don'ts

### Do's
- Do use high-contrast text alignments and offset grids.
- Do drench sections with solid background fills on hover.
- Do keep borders sharp, thick, and black/white.

### Don'ts
- Don't use soft drop shadows, blurs, or gradients.
- Don't use rounded pill badges; keep them square-edged or slightly boxed.
- Don't center-align body content; align left to preserve the brutalist edge.
