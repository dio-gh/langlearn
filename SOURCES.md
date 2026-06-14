# Sources

Research snapshots are cloned under `.research/` and excluded from the
deployable site.

## Normative

- Go 1.26.4 source and specification
  - Repository: https://github.com/golang/go
  - Revision: `a9ce111d580581fb925ae88f125c69b7d93504ea`
  - Spec source: `doc/go_spec.html`
  - Parser cross-checks: `src/go/parser/parser.go`,
    `src/cmd/compile/internal/syntax/parser.go`
  - License notice for generated grammar data: `assets/licenses/go.txt`

- Go 1.26.4 Windows AMD64 toolchain
  - Download: https://go.dev/dl/go1.26.4.windows-amd64.zip
  - SHA-256: `3ca8fb4630b07c419cbdd51f754e31363cfcfb83b3a5354d9e895c90be2cc345`
  - Used to parse syntax, execute meaning cases, and type-check library options

## Cross-checks

- Tree-sitter Go grammar
  - Repository: https://github.com/tree-sitter/tree-sitter-go
  - Revision: `2346a3ab1bb3857b48b29d779a1ef9799a248cd7`
- ANTLR grammars-v4 Go grammar
  - Repository: https://github.com/antlr/grammars-v4
  - Revision: `99edd048f64db545b20da57a3dda0ab279b0fd6e`

These implementation grammars are used to inspect ambiguity handling,
semicolon/newline treatment, precedence, and parser-friendly deviations. They
do not override the stable language specification.

## Font

- Go Mono
  - Repository: https://github.com/golang/image
  - Revision: `3fd0b0746d13f339f4559383bb970a19ff842764`
  - Files: `font/gofont/ttfs/Go-Mono.ttf`,
    `font/gofont/ttfs/Go-Mono-Bold.ttf`
  - License: `assets/fonts/LICENSE.txt`
