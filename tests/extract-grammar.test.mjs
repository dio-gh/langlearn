import assert from "node:assert/strict";
import test from "node:test";
import { extractSpec, parseGrammar, tokenize } from "../tools/extract-grammar.mjs";

test("tokenizes literals, options, repeats, ranges, and prose", () => {
  const tokens = tokenize('A = "a" … "z" [ B ] { C } | /* any rune */ .');
  assert.deepEqual(tokens.map((token) => token.type), [
    "identifier", "=", "literal", "…", "literal", "[", "identifier", "]",
    "{", "identifier", "}", "|", "prose", ".",
  ]);
});

test("parses modified EBNF into a structural AST", () => {
  const grammar = parseGrammar('List = Item { "," Item } [ "," ] .');
  assert.equal(grammar.List.kind, "sequence");
  assert.equal(grammar.List.items[1].kind, "repeat");
  assert.equal(grammar.List.items[2].kind, "optional");
});

test("extracts EBNF blocks and language version", () => {
  const result = extractSpec(`
    <script>{"Subtitle": "Language version go1.26 (Jan 12, 2026)"}</script>
    <pre class="ebnf">Name = "go" .</pre>
  `);
  assert.equal(result.version, "go1.26 (Jan 12, 2026)");
  assert.equal(result.blocks, 1);
  assert.equal(result.source, 'Name = "go" .');
});
