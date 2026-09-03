# CLAUDE.md

Guidance for working on this repository.

## What this is

**Elizabeth Portfolio** — a single-page, immersive photography portfolio.
Hero (with a mouse-follow focus effect) → About → a scattered "Contact Sheet"
flat-lay gallery → five "chapter" sections (one per photo series) → Contact,
with scroll-triggered reveal and parallax animations throughout. Hand-written
**vanilla HTML + CSS + JS** — no framework, no build step, no dependencies.
Deployed via **GitHub Pages**.

The site currently ships with a **mix of Elizabeth's real photos and
placeholder images/copy** — real photos have started replacing placeholders
in `upload/album/` (see "Images" below); the rest of the site still has
placeholder copy. Every remaining placeholder is marked so it's easy to find
and swap — see "Swapping in real content" below.

## Project layout

```
index.html          # The entire site — one page, all sections
css/
  tokens.css         # Design tokens: colors, type, spacing, motion (:root custom properties)
  style.css          # All component/layout CSS, organized by section (see its table of contents)
js/
  main.js            # All behavior: scroll-reveal, parallax, nav, scroll-progress bar, loupe
upload/
  album/              # Placeholder photos — hero + chapter 03 (square grid) + flat-lay prints
  gallery/             # Placeholder photos — chapter 01 (diptych) + chapter 05 (wide) + flat-lay prints
  masonry/             # Placeholder photos — chapter 02 (mosaic) + flat-lay prints
  showcase/            # Placeholder photos — about portrait + chapter 04 (portrait pair) + flat-lay prints
mermaid/             # Scott Simpson's "Mermaid" font files — NOT used on the site, see Fonts below
```

There is no `scss/`, no Bootstrap/jQuery, no `images/` theme chrome, and no
other HTML pages — the old "Shutter" theme clone this project started from
has been fully removed. Nav links are in-page anchors only (`#about`,
`#work`, `#contact`); there are no links to pages that don't exist.

## Editing workflow

Everything is source — **there is no compile/build step**. Edit
`index.html`, `css/tokens.css`, `css/style.css`, or `js/main.js` directly and
refresh the browser.

- **Colors, fonts, spacing, animation timing:** edit `css/tokens.css` first —
  it's the single source for those values.
- **Layout/component styles:** `css/style.css`, organized into numbered
  sections (see the table of contents comment at the top of the file).
- **Content/structure:** `index.html` directly.
- **Animation behavior:** `js/main.js` — small, single-purpose functions
  (`initReveal`, `initHeaderAndNav`, `initParallax`, `initScrollProgress`,
  `initLoupe`), each documented inline.

### Adding or removing a "chapter" (work section)

Each chapter is a self-contained `<article class="chapter chapter--VARIANT" id="chapter-NN">`
block in `index.html`. Five layout variants already exist in `css/style.css`:
`chapter--diptych`, `chapter--mosaic`, `chapter--grid`, `chapter--portrait`,
`chapter--wide`. To add a chapter, copy an existing `<article>` block whose
variant fits, swap the images/text, and give it a unique `id`. No CSS or JS
changes are needed. To remove one, delete its `<article>` block.

### Scroll animation attributes

- `data-reveal` — fades/blurs the element in as it scrolls into view, and
  fades/blurs it back out again if it scrolls back out of view (either
  direction — this is bidirectional, not a one-time reveal).
- `data-parallax` (optional `data-parallax-speed="0.1"–"0.3"`) — the element
  translates slightly as the page scrolls, for depth.

Both are respected automatically by `js/main.js`, including disabling
parallax on touch devices and disabling all motion for
`prefers-reduced-motion: reduce`.

### Loupe (mouse-follow focus effect)

A blurred image with a sharp copy stacked on top, masked to a circle that
follows the pointer — moving the mouse over it "focuses" a small circular
area, like a photographer's loupe. Not currently used anywhere on the site
(the hero photo used to use it, but was reverted to a plain static image) —
kept here as a ready-to-use pattern.

To add it to an image, wrap two copies of the same `<img>` (one gets
`class="loupe-blurred"`, the other `class="loupe-sharp" aria-hidden="true"`
with an empty `alt`) in a container:
```html
<div class="loupe is-idle" data-loupe>
  <img class="loupe-blurred" src="..." alt="Real description here">
  <img class="loupe-sharp" src="..." alt="" aria-hidden="true">
</div>
```
`js/main.js`'s `initLoupe()` finds every `[data-loupe]` and handles the rest.
On touch devices the effect is skipped entirely and the CSS in `style.css`
section 5 just shows the photo sharp (no pointer to track, so no blur).

### Flat-lay "Contact Sheet" gallery

The section between About and the chapters (`#flatlay` in `index.html`)
scatters a handful of prints at slight angles like proofs laid out on a
table, each with its own reveal stagger. To add or remove a print, copy or
delete a `.flatlay-item` block inside `.flatlay-grid` — the rotation angle
and reveal delay are assigned automatically by `:nth-child` position in
`css/style.css` section 7 and repeat every 6 items, so any number of prints
works with no per-item CSS.

## Swapping in real content

- **Photos:** every placeholder `<img>` has `alt="Placeholder — ..."`
  describing what should go there. Find them all with:
  ```bash
  grep -n "Placeholder —" index.html
  ```
  Replace the `src`/`srcset` with the real photo at the same path (or update
  the path), and rewrite the `alt` text to describe the actual photograph.
  Each image slot has a CSS `aspect-ratio` on its container with
  `object-fit: cover`, so a real photo doesn't need to match the
  placeholder's exact dimensions.
- **Bio/series text:** replace the bracketed `[Placeholder — ...]` paragraphs
  in the About section and each chapter's `chapter-desc`/`chapter-title`.
- **Contact email:** update the `mailto:` link in the Contact section. If a
  real form is wanted later, there's a comment in `index.html` noting how to
  wire up Formspree without a backend.

## Images

Every photo on the site is served as a `1x`/`2x` pair via `srcset`
(`src="X.jpg" srcset="X.jpg 1x, X@2x.jpg 2x"`) — never link a raw
camera-resolution file directly, it'll be several MB and tank load time.

**When dropping in a real photo to replace a placeholder:** resize it into
the pair yourself before committing (there's no build step to do this
automatically). Target long-edge dimensions by where it's used:

| Usage | 1x | 2x |
|---|---|---|
| Hero (full-bleed) | 1600px | 3200px |
| Chapter grid tiles (`chapter--grid`, `chapter--mosaic`, etc.) | 700px | 1400px |
| Flat-lay "Contact Sheet" prints | 450px | 900px |

With `sips` (built into macOS, no install needed):
```bash
sips -Z 3200 original.jpg --out upload/album/1@2x.jpg
sips -Z 1600 original.jpg --out upload/album/1.jpg
```
`-Z` scales so the *longer* edge matches the given value, preserving aspect
ratio — exact crop doesn't matter, every image slot uses
`object-fit: cover` to crop visually in the browser.

**Before resizing over an existing file, back up the original** — once
overwritten there's no git history to recover it from if it was never
committed at full resolution. A `.originals-backup/` folder at the repo root
(gitignored) is used for this; safe to delete once you've confirmed a resize
looks right and you have the source photo saved elsewhere too.

## Fonts

Three fonts, all loaded from Google Fonts (fully free for commercial/web
use) via the `<link>` tags in `index.html`'s `<head>`:

- **Playfair Display** (`--font-display`) — headings, chapter titles.
- **Montserrat** (`--font-body`) — body copy, nav, UI text.
- **WindSong** (`--font-accent`) — a decorative swash script, used sparingly
  as an accent: the wordmark's initial "E" and the `.drop-cap` class (for a
  bio's opening initial, once real text replaces the placeholder).

**Do not use the `mermaid/` folder's font files on the site.** They're
Scott Simpson's "Mermaid" and "Mermaid Swash Caps" fonts — free for personal
use only; the license explicitly requires a separate commercial license for
*any* web embedding (see `mermaid/readme.txt`). WindSong was chosen as a
same-spirit, legally-clear stand-in. If a licensed copy of Mermaid is ever
obtained, it can be self-hosted with an `@font-face` rule pointing at a
`.woff2` in this repo — no build step needed, it's just a static asset — but
don't add it without confirming the license covers web embedding.

## Toolchain (this machine)

Only `python3` is needed. `node`/`npm`/`sass` are **not required** — there is
nothing to install or compile.

### Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Deployed with **GitHub Pages** (see `.gitignore`, the standard GitHub
Pages/Jekyll ignore set). Pushing to the configured Pages branch publishes
the site directly — there's no build artifact to generate first.

## Conventions

- No frameworks/libraries — keep it vanilla. If a future need seems to call
  for one, prefer a small hand-written solution first.
- Keep `[data-reveal]`/`[data-parallax]` usage consistent with the patterns
  in `js/main.js` rather than adding new animation mechanisms.
- Maintain the monochrome palette defined in `css/tokens.css` — no accent
  colors were introduced by design (matches the intended editorial,
  black/white/gray photography-portfolio mood).
