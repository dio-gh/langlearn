# Generation And Guarantees

The browser never chooses from authored source-code cards. It selects a numeric
candidate from `validated.generated.js` and deterministically reconstructs the
exercise using the checked-in grammar, models, and API catalog.

## Syntax Track

1. `extract-grammar.mjs` parses every modified-EBNF block in the stable Go
   specification into an AST.
2. `GrammarExpander` starts at the stage's named production.
3. Generated lexical terminals provide identifiers and literals.
4. Named derivation profiles bound recursion and prefer pedagogically smaller
   grammar paths. They constrain productions; they contain no Go snippets.
5. The generated fragment is placed in a context appropriate to its production.
6. The Go 1.26.4 parser must accept the complete source.

Guarantee: the displayed fragment is syntactically accepted in its recorded
context by the pinned parser. It is not claimed to be type-correct in isolation;
syntax productions may legally refer to names and types supplied by surrounding
programs.

## Meaning Track

Each stage is a parameterized program family. A seed chooses values, operators,
container contents, branches, and loop bounds. The JavaScript model computes an
answer and emits a Go expression. During corpus construction, all expressions
are assembled into a Go program, executed by Go 1.26.4, and compared with the
model answers.

Guarantee: every published answer matched actual Go execution at build time.

## Library Track

`extract-stdlib/main.go` uses `go/types` to extract exported function
signatures from the pinned standard library. The synthesizer chooses a function,
generates arguments from its parameter types, and draws distractor names from
other extracted packages. Every option is substituted into the same source and
checked with `go/types`.

Guarantee: exactly one displayed option type-checked in the generated context.

## Bounded Seed Space

Arbitrary infinite generation and exhaustive compiler validation are
incompatible. The site therefore uses a bounded, generated seed space: 48 seeds
per stage. This is dynamic reconstruction, not a handwritten exercise bank, and
it makes the correctness claim auditable.

The validation manifest includes SHA-256 hashes of every input involved in
generation. Tests fail if code or data changes without rebuilding the corpus.

## Adversarial Syntax Probes

Two thirds of every syntax stage's published seeds are contrast probes. The
generator mutates a parser-valid derivation by deleting or corrupting generated
delimiters, separators, operators, keywords, or identifiers. Corpus construction
keeps a candidate only when exactly one of the three displayed forms is accepted
by the Go 1.26.4 parser.

This separates recognition evidence from exact-copying performance and gives
the learner model a concrete misconception class when a near-miss is selected.
