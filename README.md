# go{} dojo

Static Go 1.26 practice, generated and validated with Go 1.26.4.

A dependency-free, static Go practice surface. Every displayed exercise is
reconstructed from a deterministic seed; there are no authored drill strings or
cards in the curriculum.

The visible interface is intentionally sparse: code, symbols, progress, and
feedback carry nearly all of the instruction.

## Run

Serve the repository root with any static server:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`. GitHub Pages can publish the repository root
without a build step.

Progress and settings are stored in `localStorage`. The site makes no network
requests and ships its own Go Mono font.

## Generation guarantees

- Syntax drills expand a named production in the extracted Go 1.26 EBNF. Only
  seeds accepted by the Go 1.26.4 parser are published.
- Meaning drills synthesize parameterized programs. Every published answer is
  compared with the output of the real Go 1.26.4 program.
- Library drills use signatures extracted from the Go 1.26.4 standard library.
  A seed is published only when exactly one displayed option type-checks.
- The validation manifest stores numbers only. The browser regenerates the
  exercise from its seed.

The checked-in corpus contains 48 validated seeds for each of 34 stages: 1,632
generated exercises. See `docs/GENERATION.md` for the trust model and limits.

Mastery is evidence-based rather than completion-based. Distinct seeds,
first-try adversarial probes, misconception coverage, recent accuracy, and
retention spacing must all pass; contradictory evidence reopens a stage. See
`docs/LEARNING_MODEL.md`.

The normative product and architecture description is in
`docs/SPECIFICATION.md`. It defines construction, discrimination, prediction,
API completion, and retention knowledge probes.

## Rebuild

Clone the pinned source snapshots, then regenerate the grammar, API catalog, and
validated seed manifest. Rebuilding requires PowerShell and Node.js 20 or newer:

```powershell
pwsh tools/fetch-sources.ps1
pwsh tools/rebuild.ps1
```

The rebuild script downloads the official Go 1.26.4 Windows toolchain, verifies
its SHA-256 checksum, and uses it as the parser/compiler oracle.

## Layout

- `src/data/go-grammar.generated.js`: generated formal grammar AST
- `src/data/curriculum.js`: production-linked stage metadata, with no drill text
- `src/data/validated.generated.js`: compiler-approved numeric seeds
- `src/data/stdlib.generated.js`: API signatures extracted from Go 1.26.4
- `src/core/grammar.js`: grammar lookup, traversal, and compact formatting
- `src/core/grammar-expander.js`: bounded formal-grammar derivation
- `src/core/synthesizers.js`: generated syntax, meaning, and API models
- `src/core/exercises.js`: validated-seed selection and reconstruction
- `src/core/course.js`: mastery, unlocking, and track progression
- `src/core/sessions.js`: typing and choice interaction state
- `src/core/store.js`: versioned client-side persistence
- `tools/extract-grammar.mjs`: zero-dependency EBNF extractor
- `tools/build-corpus.mjs`: parser, execution, and type-check acceptance build
- `tests/generated-corpus.test.mjs`: full published-corpus replay

See `docs/BUILD_PLAN.md` for the tick-tock build record and
`SOURCES.md` for pinned research inputs. Deployment instructions are in
`docs/DEPLOYMENT.md`; client-side data handling is documented in
`docs/PRIVACY.md`.

## License

The project is licensed under GPL-3.0; see `LICENSE`. Go-derived data and the
bundled Go Mono fonts retain their upstream notices under `assets/`.
