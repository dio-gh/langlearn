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

test("counter placeholders do not claim unearned accuracy", () => {
  assert.match(html, /id="accuracy">--<\/b>/);
  const view = readFileSync(resolve(root, "src/view.js"), "utf8");
  const learner = readFileSync(resolve(root, "src/core/learner.js"), "utf8");
  assert.match(view, /course\.trackProgress/);
  assert.match(view, /performance\.accuracy/);
  assert.match(learner, /state\.learner\.performance/);
  assert.doesNotMatch(view, /Math\.round\(100\s*\/\s*session\.attempts\)/);
});

test("all live duration metrics share idle-aware active time", () => {
  const app = readFileSync(resolve(root, "src/app.js"), "utf8");
  const sessions = readFileSync(resolve(root, "src/core/sessions.js"), "utf8");
  const timing = readFileSync(resolve(root, "src/core/timing.js"), "utf8");
  assert.match(app, /createSession\(this\.exercise,\s*this\.clock\)/);
  assert.match(app, /visibilitychange/);
  assert.match(app, /this\.clock\.activity\(\)/);
  assert.match(sessions, /this\.clock\.now\(\)/);
  assert.match(timing, /idleThreshold/);
  assert.match(timing, /synchronizedDuration/);
  assert.match(timing, /idle:\s*this\.idle/);
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
    "src/languages/go/data/names.generated.js",
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
