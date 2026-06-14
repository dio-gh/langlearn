# Go Course Generation And Guarantees

The browser never chooses from authored source-code cards. It selects a numeric
candidate from `src/languages/go/data/validated.generated.js` and
deterministically reconstructs the exercise from checked-in grammar, models,
and API data.

All Go-specific builders live under `tools/go/`.

## Syntax Track

1. `tools/go/extract-grammar.mjs` parses modified-EBNF blocks in the stable Go
   specification into an AST.
2. `GrammarExpander` starts at the stage's named production.
3. Generated lexical terminals provide identifiers and literals.
4. Derivation profiles bound recursion and prefer smaller grammar paths without
   containing Go snippets.
5. The fragment is placed in a context appropriate to its production.
6. The Go 1.26.4 parser must accept the complete source.

The displayed fragment is syntactically accepted in its recorded context. It is
not necessarily type-correct in isolation.

## Behavior Track

Each stage is a parameterized program family. A seed chooses values, operators,
container contents, branches, and loop bounds. JavaScript computes an answer
and emits Go code. Corpus construction executes all cases with Go 1.26.4 and
compares runtime output with the model.

## Library Track

`tools/go/extract-stdlib/main.go` uses `go/types` to extract exported function
signatures. The synthesizer generates arguments and distractors. Every option
is substituted into the same source and checked with `go/types`; exactly one
must type-check.

## Bounded Seed Space

The site publishes 48 generated seeds per stage. This bounded corpus makes the
correctness claim replayable while preserving dynamic reconstruction. It is not
a handwritten exercise bank.

The manifest hashes every generation input. Tests fail if generators,
curriculum, grammar data, library data, or validation tools change without a
corpus rebuild.

On Windows, the build disables Go's optional module index and reads package
sources directly. This avoids stale-index failures when `GOROOT` is mapped away
from a non-ASCII profile path; parser, execution, and type-check semantics are
unchanged. Go build caches and compiler temporary files are kept under the
ignored `.research/` tree rather than machine-global profile directories.

Two thirds of each syntax stage are adversarial contrast probes. A candidate is
published only when the real parser accepts exactly one displayed form.
