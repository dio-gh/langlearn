import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { exerciseSeed } from "../src/core/exercises.js";
import { GrammarCatalog } from "../src/core/grammar.js";
import { tracks } from "../src/languages/go/curriculum.js";
import { grammarMetadata, grammarProductions } from "../src/languages/go/data/grammar.generated.js";
import { standardLibrary, standardLibraryMetadata } from "../src/languages/go/data/stdlib.generated.js";
import { validatedSeeds, validationMetadata } from "../src/languages/go/data/validated.generated.js";
import { SynthesizerRegistry } from "../src/languages/go/synthesizers.js";

const grammar = new GrammarCatalog(grammarMetadata, grammarProductions);
const registry = new SynthesizerRegistry(grammar, standardLibrary);
const root = resolve(import.meta.dirname, "..");
const goRoot = process.env.GOROOT126 ?? resolve(root, ".research/go1.26.4-full/go");
const go = process.env.GO126 ?? resolve(goRoot, "bin/go.exe");
const goCache = process.env.GOCACHE ?? resolve(root, ".research/go-build-cache");
const goTemp = process.env.GOTMPDIR ?? resolve(root, ".research/go-tmp");
mkdirSync(goCache, { recursive: true });
mkdirSync(goTemp, { recursive: true });
const goEnv = {
  ...process.env,
  GOROOT: goRoot,
  GOTOOLCHAIN: "local",
  GODEBUG: [process.env.GODEBUG, "goindex=0"].filter(Boolean).join(","),
  GOCACHE: goCache,
  GOTMPDIR: goTemp,
};

function wrapSyntax(code, context) {
  if (context === "package" || context === "file") return `${code}\n`;
  if (context === "declaration") return `package practice\n\n${code}\n`;
  if (context === "statement") return `package practice\n\nfunc practice() {\n${code}\n}\n`;
  if (context === "expression") return `package practice\n\nvar _ = ${code}\n`;
  if (context === "type") return `package practice\n\ntype Generated ${code}\n`;
  if (context === "range") return `package practice\n\nfunc practice() {\nfor ${code} {}\n}\n`;
  if (context === "typeParameters") return `package practice\n\nfunc generated${code}() {}\n`;
  throw new RangeError(context);
}

test("manifest is pinned to Go 1.26.4 and the extracted grammar", () => {
  assert.match(validationMetadata.toolchain, /go1\.26\.4/);
  assert.match(standardLibraryMetadata.toolchain, /go1\.26\.4/);
  assert.equal(standardLibraryMetadata.functionCount, Object.values(standardLibrary).flat().length);
  assert.equal(validationMetadata.grammarRevision, grammarMetadata.revision);
  for (const [path, expected] of Object.entries(validationMetadata.inputs)) {
    const actual = createHash("sha256").update(readFileSync(resolve(import.meta.dirname, "..", path))).digest("hex");
    assert.equal(actual, expected, `${path} changed without rebuilding the corpus`);
  }
});

test("every published syntax seed still parses", () => {
  const track = tracks.find((item) => item.id === "syntax");
  const requests = [];
  const exercises = [];
  for (const stage of track.stages) {
    for (const candidate of validatedSeeds.syntax[stage.id]) {
      const exercise = registry.generate(stage, exerciseSeed("go", track, stage, candidate));
      const variants = exercise.kind === "choice" ? exercise.options : [exercise.code];
      exercises.push({ stage, candidate, exercise, variants });
      for (const [index, code] of variants.entries()) {
        requests.push({
          id: `${stage.id}:${candidate}:${index}`,
          mode: "parse",
          source: wrapSyntax(code, exercise.context),
        });
      }
    }
  }
  const responses = JSON.parse(execFileSync(go, ["run", "./tools/go/validate/main.go"], {
    cwd: root,
    encoding: "utf8",
    input: JSON.stringify(requests),
    maxBuffer: 64 * 1024 * 1024,
    env: goEnv,
  }));
  const validity = new Map(responses.map((item) => [item.id, item.valid]));
  for (const { stage, candidate, exercise, variants } of exercises) {
    const valid = variants.filter((_, index) => validity.get(`${stage.id}:${candidate}:${index}`));
    assert.deepEqual(valid, [exercise.kind === "choice" ? exercise.answer : exercise.code],
      `${stage.id}:${candidate}`);
    assert.ok(exercise.derivation.includes(stage.production));
  }
});

test("syntax corpus is weighted toward adversarial contrast probes", () => {
  const track = tracks.find((item) => item.id === "syntax");
  for (const stage of track.stages) {
    const exercises = validatedSeeds.syntax[stage.id]
      .map((candidate) => registry.generate(stage, exerciseSeed("go", track, stage, candidate)));
    assert.equal(exercises.filter((exercise) => exercise.kind === "choice").length, 32);
    assert.equal(exercises.filter((exercise) => exercise.kind === "typing").length, 16);
    assert.ok(exercises.filter((exercise) => exercise.kind === "choice")
      .every((exercise) => Object.keys(exercise.diagnostics).length >= 2));
  }
});

test("published choice seeds are generated, unique, and card-free", () => {
  for (const track of tracks.filter((item) => item.id !== "syntax")) {
    for (const stage of track.stages) {
      for (const candidate of validatedSeeds[track.id][stage.id]) {
        const exercise = registry.generate(stage, exerciseSeed("go", track, stage, candidate));
        assert.equal(exercise.options.filter((option) => option === exercise.answer).length, 1);
        assert.equal(new Set(exercise.options).size, exercise.options.length);
        assert.ok(exercise.code.length > 0);
      }
    }
  }
});

test("curriculum and validation manifest contain no authored exercise text", () => {
  const curriculum = readFileSync(
    resolve(import.meta.dirname, "../src/languages/go/curriculum.js"),
    "utf8",
  );
  assert.doesNotMatch(curriculum, /\b(code|answer|options|generator)\s*:/);

  const walk = (value) => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    if (value && typeof value === "object") {
      for (const item of Object.values(value)) walk(item);
      return;
    }
    assert.equal(typeof value, "number");
  };
  walk(validatedSeeds);
});
