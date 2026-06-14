# Product Specification

## Purpose

go{} dojo is a static, dependency-free practice environment for acquiring Go
syntax, execution models, and standard-library recognition through generated
interaction rather than explanatory lessons.

The teaching priority is falsification:

1. expose an incorrect expectation
2. gather evidence that the expectation has been repaired
3. only then strengthen confidence in a correct model

The product does not equate completion, repetition, or copying with mastery.

## Release Baseline

- Language specification: Go 1.26
- Validation toolchain: Go 1.26.4
- Go source revision: `a9ce111d580581fb925ae88f125c69b7d93504ea`
- Published corpus: 48 validated seeds across each of 34 stages
- Runtime: static HTML, CSS, and JavaScript with no network requests
- Persistence: browser `localStorage` only

The on-site version badge is read from the generated validation metadata. A
release test prevents the HTML fallback and generated metadata from drifting.

## Knowledge Probes

A knowledge probe is a generated interaction chosen to test a particular claim
about the learner's model. Probe type is a primary product axis.

### Construction Probes

The learner reproduces a parser-valid generated fragment exactly. These probes
exercise token order, punctuation, and physical familiarity. A clean result is
useful evidence, but construction alone cannot establish mastery because the
fragment is visible.

### Discrimination Probes

The learner selects the sole parser-valid form among a generated derivation and
two generated near-misses. Mutations target delimiters, separators, operators,
keywords, and identifiers.

These are the strongest syntax probes because they can invalidate a concrete
expectation. Two thirds of each syntax corpus are discrimination probes.

### Prediction Probes

The learner predicts the observable result of a generated Go expression or
program. Wrong options encode plausible models such as branch inversion,
off-by-one iteration, one-based indexing, FIFO `defer`, lost closure capture,
or reversed channel receive order.

The build executes every published program with Go 1.26.4 and compares its
result with the JavaScript model.

### API Completion Probes

The learner selects an exported standard-library function that makes a
generated call type-check. Function signatures come from `go/types`, not an
authored API card set. Every displayed option is tested in the same context and
exactly one must type-check.

### Retention Probes

Retention is a scheduling mode rather than a separate exercise shape. Mastered
material becomes due after later work, and the scheduler revisits weak or old
stages. A contradiction immediately reopens the stage.

## Evidence Model

Evidence is recorded per track and stage:

- distinct validated seeds
- strong first-try probe successes
- clean and failed facets
- misconception failures and repairs
- recent outcomes
- evidence score and temporal span
- impulsive responses, corrections, and abandonment

Mastery is the minimum across independent requirements, not an average. Excess
performance on one dimension cannot compensate for no evidence on another.
Exact thresholds and revocation behavior are specified in
`docs/LEARNING_MODEL.md`.

## Adaptive Scheduling

Candidate selection favors:

1. unseen validated seeds
2. probes matching unresolved misconception debt
3. facets without clean evidence
4. adversarial choice probes
5. candidates outside the recent-seed window

Course progression interleaves the current frontier with due and weak prior
stages. The bounded corpus makes every published claim replayable; scheduling
and reconstruction remain dynamic in the browser.

## Correctness Contract

No exercise source, answer, or option list is stored in the curriculum or seed
manifest.

- Syntax acceptance uses the Go 1.26.4 parser.
- Meaning answers use actual Go 1.26.4 execution.
- Library answers use Go 1.26.4 type checking.
- The manifest stores numeric seeds and hashes every generation input.
- Tests regenerate and replay the complete published corpus.

The guarantee is bounded to the generated contexts. Syntax fragments are not
claimed to type-check in isolation, and behavioral evidence is not proof of a
learner's private mental state.

## Architecture

The runtime is separated into load-bearing modules:

- grammar catalog and bounded grammar expansion
- track-specific synthesizers
- validated-seed exercise reconstruction
- learner evidence and adaptive selection
- course progression and review scheduling
- typing/choice sessions
- versioned client-side storage
- DOM rendering and feedback

All tracks share the exercise factory, course, learner, persistence, and view
layers. Generated data is checked in so production hosting requires no build
toolchain.

## Interaction And Accessibility

The visible interface minimizes instructional prose. Track glyphs, generated
code, correctness color, progress, and repetition carry the interaction.
English remains in assistive labels and repository documentation.

Keyboard operation, visible focus, semantic buttons, live status, and local
fonts are retained. Sound is optional and generated locally.

## Privacy And Security

The production runtime:

- sends no requests
- loads no third-party scripts, styles, fonts, or analytics
- stores only practice state and settings in `localStorage`
- contains no credentials or user-specific paths

Research clones and downloaded toolchains live under ignored `.research/` and
are never part of the published site.

## Non-Goals

This release does not attempt to teach:

- complete program design
- concurrency safety or performance
- package discovery beyond the selected standard-library set
- debugging workflows
- idiomatic API composition
- proof of unaided understanding

Those areas require richer project, compiler, and semantic environments than a
small static probe surface.
