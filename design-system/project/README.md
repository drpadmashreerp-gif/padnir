# Padnir Canvas

Padnir Canvas is a presentation design system for teacher-education research: state notes, proposals, conference evidence and training reports, shown on an open canvas you zoom through instead of a deck of slides.

It began from the house style of the padnir reports (the Word documents under `rewrites/`). Those documents use Times New Roman or Calibri in black, a single accent blue (`#4F81BD`), a pale blue table head (`#D9E2F3`), 11pt body text, a 15pt bold title and 13pt bold headings. Padnir Canvas keeps that sobriety and that blue, and adds what a zooming presentation needs: an overview, topic circles, framed detail and a visible path.

## Principles

1. **Overview first.** Every talk opens on one canvas that shows all its topics at once. The audience sees the whole argument before any part of it.
2. **Zoom for detail, return for meaning.** Move into a topic frame to read evidence, then pull back to the overview so people see where that evidence sits.
3. **One path.** The order is fixed and visible in the `PathBar`. Free wandering belongs to rehearsal, not to the session.
4. **Evidence stays readable.** Tables and figures keep the report's plainness: serif text, mist headers, hairlines, numbers right-aligned.

## Voice

Plain Indian academic English, as in the reports. State the finding, then the source. Keep the writer's certainty: "may" stays "may". No hype words, no exclamation marks, no emoji. Titles are short noun phrases ("Library access in Kalaburagi"); frame text is one idea in two to four lines.

- Do: "Seven of ten DIETs reported no research grant in 2023–24."
- Don't: "A shocking funding gap is holding teachers back!"

## Colour

- `canvas` is the ground; content sits on `surface` frames lifted by `shadow-frame`.
- `canvas-blue` marks the one thing in focus: the current path step, the primary button, the opening frame. Text on it is `on-blue`.
- Topic hues — `canvas-blue`, `saffron`, `teal`, `coral` — give each overview topic its colour; a frame inherits its topic's hue on its top band only. Use at most four per canvas. Text on `saffron` and `coral` is `ink-fixed`; on `teal`, `on-teal`.
- `coral` doubles as the single alert colour, so in data it marks a gap or shortfall, never decoration.
- `report-blue` is the documents' original accent. Use it for fills and 24px+ text when a slide must match a printed report; it is too light for body text.
- `mist` heads tables and fills quiet frames; `line` draws rules.

## Type

Two families, both from Google Fonts. **Plus Jakarta Sans** (display) for everything you read from across a room: numerals, titles, headings, eyebrows, buttons. **Source Serif 4** (text) for everything you read up close: body, tables, captions — the screen descendant of the reports' Times New Roman.

| style | size / line | use |
| --- | --- | --- |
| numeral | 96/96, 800 | one key figure per frame |
| display | 64/64, 800 | overview title |
| title | 40/44, 700 | frame title (report title, 15pt) |
| heading | 24/30, 700 | section in a frame (report H1, 13pt) |
| subheading | 18/24, 600 | in `canvas-blue` (report H3 used the accent) |
| body | 17/26 serif | frame text (report body, 11pt at 1.15) |
| data | 14/20 serif | tables (report tables, 9.5–10pt) |
| caption | 13/18 serif | sources, notes |
| eyebrow | 12/16, 700, uppercase, 0.08em tracking | topic label above a title |

## Shape and space

Frames are `radius-lg` rounded rectangles on the canvas, `space-12` apart; topic circles are `radius-round`. Buttons and the path bar are `radius-md`; tables `radius-sm`. Spacing runs 4, 8, 12, 16, 24, 32, 48, 64.

## Motion

Zoom is the only transition: scale from 0.6 to 1 with a fade over 600ms, `cubic-bezier(.2,.7,.2,1)`. No spins, flips or bounces. With `prefers-reduced-motion`, cut to the frame with a 150ms fade.

## Components

Plain DOM functions on `window.PadnirCanvas` (no framework needed) that return elements styled by `components/bundle.css`:

- `Frame` — a topic frame with a hue band, eyebrow, title and body.
- `TopicCircle` — a numbered zoom target on the overview.
- `PathBar` — the fixed route through the talk, with previous and next.
- `Button` — primary, quiet and ghost.
- `DataTable` — the report table, readable on a projector.

Iconography: none yet. Use topic numerals and colour bands instead; if icons are added, use one rounded outline set at 2px stroke.
