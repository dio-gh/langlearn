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
const packages = ["strings", "strconv", "sort", "math", "bytes"];
const raw = execFileSync(go, ["run", "./tools/go/extract-stdlib/main.go", ...packages], {
  cwd: root,
  encoding: "utf8",
  env: goEnv,
});
const catalog = JSON.parse(raw);
const toolchain = execFileSync(go, ["version"], {
  encoding: "utf8",
  env: goEnv,
}).trim();
writeFileSync(
  resolve(root, "src/languages/go/data/stdlib.generated.js"),
  `// Generated Go 1.26.4 standard-library data. Do not edit.\n`
    + `export const standardLibraryMetadata = Object.freeze(${JSON.stringify({
      toolchain,
      packages,
      functionCount: Object.values(catalog).flat().length,
    }, null, 2)});\n\n`
    + `export const standardLibrary = Object.freeze(${JSON.stringify(catalog, null, 2)});\n`,
  "utf8",
);
console.log(`wrote ${Object.values(catalog).flat().length} standard-library functions`);
