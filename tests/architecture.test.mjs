import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");

test("application runtime depends on the language catalog, not Go internals", () => {
  const app = readFileSync(resolve(root, "src/app.js"), "utf8");
  assert.match(app, /languages\/catalog\.js/);
  assert.doesNotMatch(app, /languages\/go\//);
  assert.doesNotMatch(app, /go1\./i);
});

test("generic core contains no Go implementation imports or product identity", () => {
  const files = [
    "course.js",
    "exercises.js",
    "grammar.js",
    "languages.js",
    "learner.js",
    "random.js",
    "sessions.js",
    "store.js",
    "theme.js",
    "timing.js",
  ];
  const source = files
    .map((file) => readFileSync(resolve(root, "src/core", file), "utf8"))
    .join("\n");
  assert.doesNotMatch(source, /languages\/go/);
  assert.doesNotMatch(source, /go-dojo|go1\.\d|Go production/);
});

test("Go implementation is contained by its language package", () => {
  const catalog = readFileSync(resolve(root, "src/languages/catalog.js"), "utf8");
  assert.match(catalog, /\.\/go\/course\.js/);
  const course = readFileSync(resolve(root, "src/languages/go/course.js"), "utf8");
  assert.match(course, /id:\s*"go"/);
  assert.match(course, /createRuntime/);
});

test("Go build tooling is isolated from the product-wide tools root", () => {
  for (const path of [
    "tools/go/build-corpus.mjs",
    "tools/go/extract-grammar.mjs",
    "tools/go/extract-stdlib.mjs",
    "tools/go/validate/main.go",
  ]) {
    assert.equal(existsSync(resolve(root, path)), true, path);
  }
  for (const path of [
    "tools/build-corpus.mjs",
    "tools/extract-grammar.mjs",
    "tools/extract-stdlib.mjs",
    "tools/validate/main.go",
  ]) {
    assert.equal(existsSync(resolve(root, path)), false, path);
  }
});
