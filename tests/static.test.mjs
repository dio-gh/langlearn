import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8");

test("entrypoint references only local runtime assets", () => {
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(references.length > 0);
  assert.equal(references.some((value) => /^https?:/i.test(value)), false);
  for (const reference of references.filter((value) => !value.startsWith("#"))) {
    assert.equal(existsSync(resolve(root, reference)), true, reference);
  }
});

test("font sources are local and present", () => {
  const fontUrls = [...css.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.deepEqual(fontUrls, [
    "./assets/fonts/Go-Mono.ttf",
    "./assets/fonts/Go-Mono-Bold.ttf",
  ]);
  for (const url of fontUrls) {
    assert.equal(existsSync(resolve(root, url)), true, url);
  }
});

test("runtime code does not make network requests", () => {
  const files = [
    "src/app.js",
    "src/view.js",
    "src/core/course.js",
    "src/core/exercises.js",
    "src/core/grammar.js",
    "src/core/languages.js",
    "src/core/learner.js",
    "src/core/random.js",
    "src/core/sessions.js",
    "src/core/store.js",
    "src/core/theme.js",
    "src/core/timing.js",
    "src/languages/catalog.js",
    "src/languages/go/course.js",
    "src/languages/go/curriculum.js",
    "src/languages/go/grammar-expander.js",
    "src/languages/go/migration.js",
    "src/languages/go/synthesizers.js",
  ];
  const runtime = files.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");

  assert.doesNotMatch(runtime, /\bfetch\s*\(/);
  assert.doesNotMatch(runtime, /\bXMLHttpRequest\b/);
  assert.doesNotMatch(runtime, /\bWebSocket\b/);
  assert.doesNotMatch(runtime, /\bAudioContext\b/);
  assert.doesNotMatch(runtime, /\bvibrate\s*\(/);
  assert.doesNotMatch(html, /sound|mute/i);

  for (const file of files) {
    const source = readFileSync(resolve(root, file), "utf8");
    for (const match of source.matchAll(/from\s+"(\.[^"]+)"/g)) {
      assert.equal(existsSync(resolve(root, file, "..", match[1])), true, `${file}: ${match[1]}`);
    }
  }
});
