# Product Specification

## Product Boundary

`langlearn` is a static, dependency-free practice environment for acquiring
programming-language knowledge through generated interaction rather than
explanatory lessons.

The application shell is language-neutral. An installed language course owns:

- identity and visible language/toolchain version
- tracks and production-linked stages
- deterministic exercise synthesis
- generated validation data
- course-specific build tools and legacy save migrations

The shell owns evidence, adaptive scheduling, sessions, timing, themes,
persistence, rendering, and course selection. Go is the initial course, not the
product identity.

## Teaching Priority

The primary goal is falsification:

1. expose an incorrect expectation
2. gather evidence that the expectation has been repaired
3. only then strengthen confidence in a correct model

The product does not equate completion, repetition, or copying with mastery.

## Go Release Baseline

- Language specification: Go 1.26
- Validation toolchain: Go 1.26.4
- Go source revision: `a9ce111d580581fb925ae88f125c69b7d93504ea`
- Published corpus: 48 validated seeds across each of 34 stages
- Runtime: static HTML, CSS, and JavaScript with no network requests
- Persistence: browser `localStorage` only

The Go version is visible in the application header and comes from generated
validation metadata. Release tests prevent the HTML fallback and oracle
metadata from drifting.

## Knowledge Probes

A knowledge probe is a generated interaction chosen to test a claim about the
learner's model. Probe type is a primary product axis.

### Construction

The learner reproduces a parser-valid generated fragment exactly. This tests
token order, punctuation, and physical familiarity. Clean construction is
evidence, but cannot establish mastery alone because the fragment is visible.

### Discrimination

The learner selects the sole parser-valid form among a generated derivation and
generated near-misses. Mutations target delimiters, separators, operators,
keywords, and identifiers. Two thirds of the Go syntax corpus use this stronger
probe shape.

### Prediction

The learner predicts the observable result of generated code. Wrong options
encode plausible execution models such as branch inversion, off-by-one
iteration, one-based indexing, FIFO `defer`, lost closure capture, or reversed
channel receive order.

### API Completion

The learner selects an exported library function that makes a generated call
type-check. For Go, signatures come from `go/types`, not an authored card set.

### Retention

Retention is a scheduling mode. Mastered material becomes due after later work,
and contradictory evidence immediately reopens a stage.

## Pedagogical Naming

Generated syntax uses identifiers extracted from real Go 1.26.4
standard-library source. Names are separated into package, variable, function,
method, type, and field pools, then selected according to the active grammar
role. This reduces the extraneous cognitive load of decoding invented words
while preserving generated variety.

The naming corpus is data, not a drill bank: source, answers, options, and
diagnostics remain reconstructed from numeric seeds. A realistic identifier is
not presented as evidence of a meaningful domain model; correctness guarantees
remain syntactic unless a probe is separately compiler- or runtime-validated.

## Evidence And Scheduling

Evidence is namespaced by language, track, and stage:

- distinct validated seeds
- strong first-try successes
- clean and failed facets
- misconception failures and repairs
- recent outcomes
- evidence score and temporal span
- impulsive responses, corrections, abandonment, and completion duration

Mastery is the minimum across independent requirements. Candidate selection
favors unseen seeds, unresolved misconception debt, uncovered facets,
adversarial probes, and candidates outside the recent window.

## Timing

The interface displays:

- elapsed time for the current exercise
- elapsed time for the current browser session
- estimated time remaining for the current stage
- attempts or typing speed for the current exercise
- current-exercise accuracy after observable input
- a clean-evidence streak
- aggregate progress across every stage in the active track

The remaining estimate multiplies the learner's observed average completion
duration for that stage by the largest unresolved mastery requirement. Before
enough samples exist, conservative per-probe defaults are used. It is an
adaptive estimate, not a deadline or guaranteed completion time; mistakes and
newly exposed evidence deficits can increase it.

Visible timers pause after 60 seconds without keyboard, pointer, wheel, or
window-focus activity. Hiding the page pauses them immediately. The same
active-time source is used for WPM and stored completion-duration samples, so
idle time cannot inflate speed calculations or future stage estimates. The
current exercise and learner state remain intact while paused.

Accuracy is undefined before the learner acts and is displayed as `--`. For
choice probes it is zero after wrong-only selections and becomes the proportion
of correct selections after completion. The percentage beside the course bar
is the mean evidence ratio across all stages represented by that bar; the
current stage's separate evidence ratio remains encoded by its segment fill.

## Language Contract

Each course descriptor supplies an `id`, label, version, default track, track
metadata, migrations, and a runtime factory. The runtime factory supplies a
shared exercise factory and stage formatter.

The generic shell must not import language implementations directly. It reads
the language catalog, resolves the active descriptor, and stores progress under
`courses[languageId]`. Learner records use
`languageId:trackId:stageId` keys.

The Go runtime and build pipeline are contained under:

- `src/languages/go/`
- `tools/go/`

Adding another language should require a new course package and one catalog
entry, not edits to course progression, learner evidence, session handling,
theme logic, timing, or persistence.

## Correctness Contract

No exercise source, answer, or option list is stored in curriculum or seed
manifests.

- Go syntax acceptance uses the Go 1.26.4 parser.
- Go behavior answers use actual Go 1.26.4 execution.
- Go library answers use Go 1.26.4 type checking.
- Go syntax identifiers use a role-aware corpus extracted from the pinned Go
  1.26.4 standard library.
- The manifest stores numeric seeds and hashes every generation input.
- Tests regenerate and replay the complete published corpus.

The guarantee is bounded to generated contexts. Behavioral evidence is robust
evidence of performance, not proof of a private mental state.

## Interaction And Accessibility

The visible interface minimizes instructional prose while keeping navigation
explicit. Track controls use words rather than unexplained glyphs. English
remains in compact labels, assistive names, and repository documentation.

The interface provides automatic, light, and dark themes; visible keyboard
focus; semantic controls; non-color correctness cues; local fonts; and WCAG 2.2
AA contrast targets. It has no sound or vibration behavior. See
`docs/ACCESSIBILITY.md`.

## Privacy And Security

The production runtime sends no requests, loads no third-party assets or
analytics, and stores only practice state and settings in `localStorage`.
Research clones and toolchains live under ignored `.research/`.

## Non-Goals

The current release does not teach complete program design, debugging
workflows, concurrency safety, performance, package discovery, or proof of
unaided understanding. Those require richer project and compiler environments.
