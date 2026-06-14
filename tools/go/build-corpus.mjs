import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { exerciseSeed } from "../../src/core/exercises.js";
import { GrammarCatalog } from "../../src/core/grammar.js";
import { tracks } from "../../src/languages/go/curriculum.js";
import { grammarMetadata, grammarProductions } from "../../src/languages/go/data/grammar.generated.js";
import { standardLibrary } from "../../src/languages/go/data/stdlib.generated.js";
import { SynthesizerRegistry } from "../../src/languages/go/synthesizers.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
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
const nodeLimit = Number(process.env.CORPUS_SIZE ?? 48);
const candidateLimit = Number(process.env.CANDIDATE_LIMIT ?? 900);
const grammar = new GrammarCatalog(grammarMetadata, grammarProductions);
const registry = new SynthesizerRegistry(grammar, standardLibrary);
const inputFiles = [
  "src/core/exercises.js",
  "src/core/random.js",
  "src/languages/go/curriculum.js",
  "src/languages/go/grammar-expander.js",
  "src/languages/go/synthesizers.js",
  "src/languages/go/data/grammar.generated.js",
  "src/languages/go/data/names.generated.js",
  "src/languages/go/data/stdlib.generated.js",
  "tools/go/build-corpus.mjs",
  "tools/go/extract-names.mjs",
  "tools/go/extract-names/main.go",
  "tools/go/extract-grammar.mjs",
  "tools/go/extract-stdlib.mjs",
  "tools/go/extract-stdlib/main.go",
  "tools/go/validate/main.go",
];

function hashFile(path) {
  return createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex");
}

function wrapSyntax(code, context) {
  if (context === "package" || context === "file") return `${code}\n`;
  if (context === "declaration") return `package practice\n\n${code}\n`;
  if (context === "statement") return `package practice\n\nfunc practice() {\n${code}\n}\n`;
  if (context === "expression") return `package practice\n\nvar _ = ${code}\n`;
  if (context === "type") return `package practice\n\ntype Generated ${code}\n`;
  if (context === "range") return `package practice\n\nfunc practice() {\nfor ${code} {}\n}\n`;
  if (context === "typeParameters") return `package practice\n\nfunc generated${code}() {}\n`;
  throw new RangeError(`Unknown syntax context ${context}`);
}

function runValidator(requests) {
  if (!requests.length) return [];
  const output = execFileSync(go, ["run", "./tools/go/validate/main.go"], {
    cwd: root,
    encoding: "utf8",
    input: JSON.stringify(requests),
    maxBuffer: 64 * 1024 * 1024,
    env: goEnv,
  });
  return JSON.parse(output);
}

function buildSyntax(track) {
  const result = {};
  for (const stage of track.stages) {
    const requests = [];
    const exercises = new Map();
    for (let candidate = 0; candidate < candidateLimit; candidate += 1) {
      const exercise = registry.generate(stage, exerciseSeed("go", track, stage, candidate));
      exercises.set(candidate, exercise);
      if (exercise.kind === "typing") {
        requests.push({
          id: `${candidate}:typing`,
          mode: "parse",
          source: wrapSyntax(exercise.code, exercise.context),
        });
      } else {
        for (const [index, option] of exercise.options.entries()) {
          requests.push({
            id: `${candidate}:choice:${index}`,
            mode: "parse",
            source: wrapSyntax(option, exercise.context),
          });
        }
      }
    }
    const validity = new Map(runValidator(requests).map((item) => [item.id, item.valid]));
    const typing = [];
    const contrast = [];
    for (const [candidate, exercise] of exercises) {
      if (exercise.kind === "typing" && validity.get(`${candidate}:typing`)) {
        typing.push(candidate);
      }
      if (exercise.kind === "choice") {
        const valid = exercise.options.filter((_, index) => validity.get(`${candidate}:choice:${index}`));
        if (valid.length === 1 && valid[0] === exercise.answer) contrast.push(candidate);
      }
    }
    const typingTarget = Math.floor(nodeLimit / 3);
    const contrastTarget = nodeLimit - typingTarget;
    result[stage.id] = [
      ...typing.slice(0, typingTarget),
      ...contrast.slice(0, contrastTarget),
    ];
    if (result[stage.id].length < nodeLimit) {
      throw new Error(
        `${stage.id}: ${typing.length} typing, ${contrast.length} contrast; `
        + `only ${result[stage.id].length}/${nodeLimit} selected`,
      );
    }
    console.log(`syntax ${stage.id}: ${result[stage.id].length}`);
  }
  return result;
}

function buildMeaning(track) {
  const result = {};
  const cases = [];
  for (const stage of track.stages) {
    result[stage.id] = [];
    for (let candidate = 0; candidate < nodeLimit; candidate += 1) {
      const seed = exerciseSeed("go", track, stage, candidate);
      const exercise = registry.generate(stage, seed);
      result[stage.id].push(candidate);
      cases.push({ stage: stage.id, candidate, exercise });
    }
  }

  const source = `package main

import (
\t"encoding/json"
\t"fmt"
)

func main() {
\tvalues := []string{
${cases.map(({ exercise }) => `\t\tfmt.Sprint(${exercise.expression}),`).join("\n")}
\t}
\tdata, _ := json.Marshal(values)
\tfmt.Print(string(data))
}
`;
  const directory = mkdtempSync(resolve(tmpdir(), "langlearn-go-"));
  const file = resolve(directory, "main.go");
  try {
    writeFileSync(file, source, "utf8");
    const output = execFileSync(go, ["run", file], {
      encoding: "utf8",
      env: goEnv,
    });
    const actual = JSON.parse(output);
    cases.forEach(({ stage, candidate, exercise }, index) => {
      if (actual[index] !== exercise.answer) {
        throw new Error(`meaning ${stage}:${candidate}: JS=${exercise.answer} Go=${actual[index]}`);
      }
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  console.log(`meaning: ${cases.length} executed`);
  return result;
}

function buildLibrary(track) {
  const result = {};
  for (const stage of track.stages) {
    const accepted = [];
    const candidates = [];
    for (let candidate = 0; candidate < candidateLimit && candidates.length < nodeLimit * 5; candidate += 1) {
      try {
        const exercise = registry.generate(stage, exerciseSeed("go", track, stage, candidate));
        candidates.push({ candidate, exercise });
      } catch {
        // Unsupported signatures are deliberately outside the generated subset.
      }
    }

    const requests = candidates.flatMap(({ candidate, exercise }) => exercise.options.map((option) => ({
      id: `${candidate}:${option}`,
      mode: "typecheck",
      source: `package practice

import ${JSON.stringify(exercise.packagePath)}

func practice() {
\t${exercise.sourceTemplate.replace("BOX", option)}
}
`,
    })));
    const validity = new Map(runValidator(requests).map((item) => [item.id, item.valid]));
    for (const { candidate, exercise } of candidates) {
      const valid = exercise.options.filter((option) => validity.get(`${candidate}:${option}`));
      if (valid.length === 1 && valid[0] === exercise.answer) accepted.push(candidate);
      if (accepted.length === nodeLimit) break;
    }
    result[stage.id] = accepted;
    if (accepted.length < nodeLimit) {
      throw new Error(`${stage.id}: only ${accepted.length}/${nodeLimit} unique library seeds`);
    }
    console.log(`library ${stage.id}: ${accepted.length}`);
  }
  return result;
}

const validatedSeeds = {};
for (const track of tracks) {
  if (track.id === "syntax") validatedSeeds[track.id] = buildSyntax(track);
  if (track.id === "meaning") validatedSeeds[track.id] = buildMeaning(track);
  if (track.id === "library") validatedSeeds[track.id] = buildLibrary(track);
}

const toolVersion = execFileSync(go, ["version"], {
  encoding: "utf8",
  env: goEnv,
}).trim();
const metadata = {
  toolchain: toolVersion,
  grammarRevision: grammarMetadata.revision,
  corpusSize: nodeLimit,
  inputs: Object.fromEntries(inputFiles.map((path) => [path, hashFile(path)])),
};
writeFileSync(
  resolve(root, "src/languages/go/data/validated.generated.js"),
  `// Generated Go corpus seeds, not exercise text. Do not edit.\n`
    + `export const validationMetadata = Object.freeze(${JSON.stringify(metadata, null, 2)});\n\n`
    + `export const validatedSeeds = Object.freeze(${JSON.stringify(validatedSeeds, null, 2)});\n`,
  "utf8",
);
console.log("wrote src/languages/go/data/validated.generated.js");

export { wrapSyntax };
