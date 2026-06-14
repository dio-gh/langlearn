# Build Plan

## Pass 1: Feature tick

Build the smallest complete practice loop:

- exact typing capture
- per-character correct/error feedback
- WPM, accuracy, streak, and completion
- linear stages and client-side persistence
- minimal course map

The prototype intentionally kept curriculum and UI state together so the
interaction could be judged before abstractions hardened around it.

## Pass 2: Architecture tock

Replace the prototype data path with reusable pieces:

- extract the stable specification EBNF into a generated grammar AST
- validate every curriculum stage against a named production
- make generation deterministic by track, stage, and attempt
- separate grammar, exercise, course, session, storage, feedback, and view state
- migrate prototype saves into a versioned store

These pieces are load-bearing: all three tracks use the same factory, course,
store, and view.

## Pass 3: Feature tick

Extend beyond syntax without embedding a compiler:

- **`{}` syntax:** production-linked exact typing
- **`⇒` meaning:** predict observable values and ordering
- **`.` library:** choose the standard-library selector that completes code

This pass used provisional authored examples to judge the interaction. The
second iteration replaced them with generated program families and extracted
API signatures, with the Go toolchain as the acceptance oracle.

## Pass 4: Architecture tock

Harden the static artifact:

- pin source revisions and stable language version
- ship fonts and licenses locally
- replay generated drills with the Go parser, runtime, and type checker
- unit-test extraction, progression, sessions, and deterministic generation
- retain a zero-build GitHub Pages deployment path

## Second Iteration

### Feature tick

- replace source-code cards with formal EBNF expansion
- add generated semantic program families
- extract standard-library signatures with `go/types`

### Architecture tock

- publish only numeric seeds accepted by the pinned Go 1.26.4 toolchain
- bind the manifest to generator-input SHA-256 hashes
- make parser, execution, and type-check validation load-bearing
- add derivation profiles to reduce complexity without embedding drill text

### Feature tick

- expand every stage to 48 generated and validated exercises
- preserve three tracks through the same factory and progression engine

### Architecture tock

- add a reproducible toolchain download and checksum workflow
- replay every published syntax seed in tests
- assert that curriculum and validation data contain no authored exercise text

## Later Experiments

- spaced repetition weighted by error location and production dependency
- compile/run exercises through a locally shipped WebAssembly evaluator
- semantic mutation drills: change one token to reach a shown output
- standard-library mini-project chains with a tiny virtual filesystem
- keyboard-layout-aware punctuation warmups

## Third Iteration

### Feature Tick

- generate parser-verified valid-versus-near-miss syntax contrasts
- attach misconception classes to every wrong choice
- record misses, corrections, latency, seed diversity, and facet coverage

### Architecture Tock

- replace completion counters with a reusable evidence ledger
- make mastery the minimum of several independent evidence requirements
- add adaptive candidate selection and scheduled prerequisite review
- migrate old progress as exposure only, never as proof of mastery

### Feature Tick

- add plausible semantic distractors for common wrong models
- display review state and mastery confidence without instructional prose
- weight the syntax corpus two-to-one toward adversarial discrimination

### Architecture Tock

- make contradictory evidence revoke mastery immediately
- test that copying, repetition, and guess-cycling cannot unlock stages
- document evidence thresholds, misconception targeting, and epistemic limits
