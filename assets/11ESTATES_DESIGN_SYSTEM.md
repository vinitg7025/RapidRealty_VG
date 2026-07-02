# 11 Estates Design System & Style Specification

This document details the exact design tokens, structural layouts, typography, component hierarchies, and code patterns used to craft the premium, high-end editorial aesthetic of the **11 Estates** website. 

Use these specifications as a blueprint or direct system input to guarantee seamless brand and visual consistency across all newly built pages.

---

## 1. Core Color Tokens (Tailwind CSS)

The palette uses a high-contrast cinematic dark theme composed of rich charcoal layers, neutral stones, and warm amber-gold highlights.

| Token Name | Hex Value | Tailwind Class | Usage / Intent |
| :--- | :--- | :--- | :--- |
| **Primary Charcoal** | `#121212` | `bg-brand-charcoal` | Page body background, primary dark canvas, overlays. |
| **Secondary Graphite** | `#1a1a1a` | `bg-brand-graphite` | Alt section backgrounds, card base states, structural dividers. |
| **Border Stone** | `#4a4a4a` | `border-brand-stone` | Subtle borders, structural frames, dividers (mostly at `/10` or `/15` opacity). |
| **Primary White** | `#ffffff` | `text-white` | Primary display headlines, high-contrast text. |
| **Brand Silver** | `#a3a3a3` | `text-brand-silver` | Body copy, secondary descriptions, labels. |
| **Brand Amber/Gold** | `#f59e0b` | `text-amber-500` | Micro-labels, active state accents, numeric counters. |

---

## 2. Typography & Font Pairing

The visual signature is driven by pairing a precision sans-serif font for utility, tracking, and structure with an elegant editorial serif font for dramatic narrative focal points.

*   **Display / Editorial (Serif)**: `Playfair Display`, `ui-serif`, `Georgia`
    *   *Usage*: Page titles, section headings, numbers, and stylized italicized accents.
*   **Utility & Copy (Sans)**: `Inter`, `ui-sans-serif`, `system-ui`
    *   *Usage*: Paragraph body text, labels, buttons, navigation links, and micro-metrics.

### Standard Typography Styling Snippets:

*   **Section Title (Editorial Header)**:
    ```html
    <h2 className="text-4xl md:text-5.5xl font-serif text-white tracking-tight leading-none">
      Access Through Decades of <br />
      <span className="italic block md:inline text-brand-silver/90 mt-1">Market Relationships</span>
    </h2>
    ```
*   **Micro-Header / Tagline (Technical Rail Accent)**:
    ```html
    <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.3em] text-amber-500 uppercase mb-3">
      <span>INSTITUTIONAL ALIGNMENT</span>
      <span className="w-6 h-[1px] bg-brand-stone/30"></span>
    </div>
    ```
*   **Body Copy (Readability & Air)**:
    ```html
    <p className="text-brand-silver/85 text-sm font-light leading-relaxed max-w-2xl">
      Your body content text here. Keep lines relatively short (max-w-xl or max-w-2xl) and light-weighted (font-light).
    </p>
    ```

---

## 3. Structural Layout & Spacing Principles

*   **Symphony of Negative Space**: Avoid cramming elements. Sections use generous vertical padding to command authority and allow layouts to breathe.
    *   *Tailwind utility*: `py-24 md:py-32`
*   **Responsive Page Boundaries**: Standard max-width wrappers prevent visual distortion on ultra-wide desktop monitors while securing clean margins on tablets and mobile screens.
    *   *Tailwind utility*: `max-w-7xl mx-auto px-6`
*   **Editorial Dividers**: Use hair-thin horizontal rules in place of thick blocky separators to organize sections.
    *   *Tailwind utility*: `border-b border-brand-stone/10` or `.editorial-divider` (`h-[1px] w-full bg-brand-stone/30 my-8`)

---

## 4. Replicable Component Blueprints

### A. Line Ledger / Asymmetric List (Instead of Grid Cards)
Rather than placing feature items in standard side-by-side card blocks, align them as a vertical stack with clean numeric counters.

```tsx
<div className="flex gap-6 pb-8 border-b border-brand-stone/10 last:border-none group">
  <span className="font-serif italic text-3xl md:text-4xl text-amber-500/40 select-none group-hover:text-amber-500 transition-colors duration-300 w-12 pt-1">
    01
  </span>
  <div className="space-y-2">
    <h4 className="text-xl font-serif text-white group-hover:text-amber-500 transition-colors duration-300">
      Title of Pillar
    </h4>
    <p className="text-brand-silver/90 text-sm font-light leading-relaxed">
      Detailed descriptive text explaining the premium advantage.
    </p>
  </div>
</div>
```

### B. High-End Statistic Grid
Display metrics with massive numeric values accompanied by ultra-precise capitalized mono labels.

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
  <div className="flex flex-col gap-3 group">
    <span className="text-3xl md:text-4xl font-serif text-white tracking-tight border-b border-brand-stone/10 pb-2 group-hover:text-amber-500 transition-colors duration-300">
      40+ Years
    </span>
    <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-mono font-medium block">
      MARKET EXPERIENCE
    </span>
    <p className="text-brand-silver/80 text-[11px] md:text-xs font-light leading-relaxed">
      Four decades of relationships, transactions and market insight.
    </p>
  </div>
</div>
```

### C. Aesthetic Hover Buttons (Call to Action)
A sleek, elegant transition indicator that draws attention through typography weight, wide tracking, and subtle animations rather than blocky borders.

```tsx
<button className="font-mono text-[10px] uppercase tracking-widest text-amber-500/90 hover:text-white transition-colors flex items-center gap-2 group border-b border-brand-stone/20 pb-0.5">
  <span>Request Advisory Integration Brief</span>
  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
</button>
```

---

## How to Export & Download This Design System

You can download this documentation along with your entire website project source files easily:

1. **Option A (Instant Download ZIP)**:
   * Go to the top-right corner of the **Google AI Studio** workspace.
   * Open the **Settings/Project Menu** (Gear icon or workspace action menu).
   * Click on **Export to ZIP** or **Export to GitHub**. This downloads the complete project package (including this markdown file) straight to your computer.

2. **Option B (Direct Clipboard Copy)**:
   * Double-click the file named `11ESTATES_DESIGN_SYSTEM.md` in your sidebar explorer to open it in the editor.
   * Copy the raw markdown text directly into any text editor of your choice (Notion, Obsidian, VS Code, Word, etc.).
