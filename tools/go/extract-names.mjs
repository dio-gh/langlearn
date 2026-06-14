import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

const raw = execFileSync(go, ["run", "./tools/go/extract-names/main.go"], {
  cwd: root,
  encoding: "utf8",
  env: goEnv,
});
const vocabulary = JSON.parse(raw);
const toolchain = execFileSync(go, ["version"], {
  encoding: "utf8",
  env: goEnv,
}).trim();
const counts = Object.fromEntries(
  Object.entries(vocabulary).map(([category, names]) => [category, names.length]),
);

writeFileSync(
  resolve(root, "src/languages/go/data/names.generated.js"),
  `// Generated from identifiers in the Go 1.26.4 standard library. Do not edit.\n`
    + `export const identifierMetadata = Object.freeze(${JSON.stringify({
      toolchain,
      source: "Go 1.26.4 standard-library AST",
      counts,
    }, null, 2)});\n\n`
    + `export const identifierVocabulary = Object.freeze(${JSON.stringify(vocabulary, null, 2)});\n`,
  "utf8",
);
console.log(`wrote ${Object.values(counts).reduce((sum, count) => sum + count, 0)} role-aware names`);
