import assert from "node:assert/strict";
import test from "node:test";
import { Random } from "../src/core/random.js";
import { lexicalProviders } from "../src/languages/go/grammar-expander.js";
import {
  identifierMetadata,
  identifierVocabulary,
} from "../src/languages/go/data/names.generated.js";

const expectedTerms = Object.freeze({
  packages: ["http", "json", "strings", "time"],
  variables: ["name", "data", "value", "path", "index", "result"],
  functions: ["Parse", "Read", "Split", "Contains"],
  methods: ["Read", "Write", "Reset", "Close"],
  types: ["Reader", "Writer", "Config", "Client"],
  fields: ["Name", "Value", "Path", "Line"],
});

test("identifier corpus is extracted from the pinned Go toolchain", () => {
  assert.match(identifierMetadata.toolchain, /go1\.26\.4/);
  assert.equal(identifierMetadata.source, "Go 1.26.4 standard-library AST");
  for (const [category, terms] of Object.entries(expectedTerms)) {
    const names = identifierVocabulary[category];
    assert.ok(names.length >= 40, category);
    assert.equal(new Set(names).size, names.length, `${category} duplicates`);
    for (const term of terms) assert.ok(names.includes(term), `${category}: ${term}`);
    for (const name of names) {
      assert.match(name, /^[A-Za-z][A-Za-z0-9]*$/, `${category}: ${name}`);
    }
  }
});

test("formal grammar identifiers use role-appropriate real names", () => {
  const cases = [
    ["PackageName", "packages"],
    ["FunctionName", "functions"],
    ["MethodName", "methods"],
    ["FieldName", "fields"],
    ["TypeName", "types"],
    ["IdentifierList", "variables"],
  ];
  for (const [owner, category] of cases) {
    const state = {
      owner,
      stack: [owner],
      identifiers: new Set(),
    };
    const generated = Array.from(
      { length: 12 },
      () => lexicalProviders.identifier(new Random(`${owner}:${state.identifiers.size}`), state),
    );
    assert.ok(generated.every((name) => identifierVocabulary[category].includes(name)), category);
  }
});
