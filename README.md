# Lüscher Color Test — Kazakh Edition

An interactive, browser-based implementation of the **Lüscher color test** in the **Kazakh language**, built as an educational psychology tool for adults and students.

> ⚠️ This is a projective self-reflection tool, **not** a clinical or diagnostic instrument. It reflects a person's current emotional state at the moment of taking it — not fixed personality traits.

## What it does

The test runs in three parts and produces a structured report:

- **Achromatic subtest** — ranking five grey tones → a general-mood reading.
- **Eight-color subtest** — two preference rankings of the eight Lüscher colors.
- **Paired comparison** — a round-robin of all color pairs → a robust preference ranking.

From these inputs the app derives:

- Functional groups (`+` / `×` / `=` / `−`), interpreted through color-**pair** meanings
- Behavioral type — the four chromatic types, with a *role-idol / role-defense* polarity
- Anxiety / compensation score (0–12)
- Actual-problem analysis with a tension ranking
- Additional indices: work capacity, autonomic balance, choice stability, ambivalence
- A history of attempts with an anxiety **trend chart**, plus **PDF export**

## Methodology & honesty notes

- The structure and scoring follow the Lüscher method as documented in V. Dragunsky's manual; **all interpretation texts are the author's own paraphrasing**, not reproductions of any source.
- The clinical "shade matrices" of the full Lüscher kit require physical cards a web app cannot replicate. The paired-comparison subtest is an honest equivalent (Thurstone-style paired comparison), and is labelled as such.
- The report includes an explicit note on the **Barnum effect** — readers are encouraged to judge the descriptions critically rather than accept them wholesale.

## Tech

- Vanilla **HTML / CSS / JavaScript** — no frameworks, no build step, no dependencies.
- History is stored locally in the browser via `localStorage`; nothing is sent anywhere.
- PDF export uses the browser's native print-to-PDF.

## Author

Built by **Inkar Togtaubaі**, 2026.

## License

All rights reserved — see [LICENSE](LICENSE).
