# langlearn

Static, generated programming-language practice. The initial course targets Go
1.26 and is generated and validated with Go 1.26.4.

`langlearn` is a language-neutral browser shell. Courses provide curriculum,
generation, validation metadata, versioning, and legacy migrations through a
small descriptor contract. The Go implementation is isolated under
`src/languages/go/`; generic progression, evidence, timing, persistence,
themes, sessions, and rendering live outside it.

Every displayed exercise is reconstructed from a deterministic numeric seed.
There are no authored drill strings or cards in the curriculum.

## Run

Serve the repository root with any static server:

```powershell
python -m http.server 8080
```

Open `http://localhost:8080`. GitHub Pages can publish the repository root
without a website build step.

Progress, theme preference, cumulative accuracy, evidence, and timing samples
are stored in `localStorage`. The site makes no runtime network requests,
contains no sound, and ships its fonts locally.

## Go Course Guarantees

- Syntax probes expand a named production in the extracted Go 1.26 EBNF. Only
  seeds accepted by the Go 1.26.4 parser are published.
- Generated identifiers are selected by syntactic role from names mined from
  human-facing Go 1.26.4 standard-library source. This keeps incidental naming
  noise familiar without storing authored exercises.
- Behavior probes synthesize parameterized programs. Every published answer is
  compared with output from the real Go 1.26.4 runtime.
- Library probes use signatures extracted from the Go 1.26.4 standard library.
  A seed is published only when exactly one displayed option type-checks.
- The validation manifest stores numeric seeds and input hashes. The browser
  reconstructs source, answers, options, and diagnostics from those seeds.

The checked-in Go corpus contains 48 validated seeds for each of 34 stages:
1,632 generated exercises. See `docs/GENERATION.md`.

Mastery is evidence-based. Distinct seeds, first-try adversarial probes,
misconception coverage, recent accuracy, and retention spacing must all pass;
contradictory evidence reopens a stage. See `docs/LEARNING_MODEL.md`.

## Rebuild The Go Course

Rebuilding requires PowerShell and Node.js 20 or newer:

```powershell
pwsh tools/go/fetch-sources.ps1
pwsh tools/go/rebuild.ps1
```

The rebuild downloads the official Go 1.26.4 Windows toolchain, verifies its
SHA-256 checksum, and uses it as the parser, runtime, and compiler oracle.

## Architecture

- `src/core/`: language-neutral course, evidence, session, theme, timing, and
  persistence contracts
- `src/languages/catalog.js`: installed course registry
- `src/languages/go/`: Go descriptor, curriculum, synthesizers, migrations,
  generated grammar, role-aware names, and validated seeds
- `tools/go/`: pinned Go grammar, API, and identifier extraction plus
  compiler-validation pipeline
- `tests/architecture.test.mjs`: enforces the generic-core boundary
- `tests/generated-corpus.test.mjs`: replays the complete published Go corpus
- `tests/accessibility.test.mjs`: checks theme contrast and interaction affordances

The normative design is in `docs/SPECIFICATION.md`. Accessibility decisions are
recorded in `docs/ACCESSIBILITY.md`, and the tick-tock implementation history is
in `docs/BUILD_PLAN.md`.

## License

The project is licensed under GPL-3.0; see `LICENSE`. Go-derived data and the
bundled Go Mono fonts retain their upstream notices under `assets/`.
