import assert from "node:assert/strict";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import test from "node:test";
import { validationMetadata } from "../src/languages/go/data/validated.generated.js";

const root = resolve(import.meta.dirname, "..");
const textExtensions = new Set([
  "",
  ".css",
  ".go",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ps1",
  ".txt",
  ".yml",
]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === ".research") return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

test("repository root is a GitHub Pages artifact", () => {
  for (const path of [
    ".nojekyll",
    "index.html",
    "styles.css",
    "src/app.js",
    "src/languages/go/course.js",
    "assets/fonts/Go-Mono.ttf",
  ]) {
    assert.equal(existsSync(resolve(root, path)), true, path);
  }
  for (const path of walk(root)) {
    assert.equal(lstatSync(path).isSymbolicLink(), false, relative(root, path));
  }
});

test("visible language version matches the validation oracle", () => {
  const expected = validationMetadata.toolchain.match(/\bgo\d+\.\d+(?:\.\d+)?\b/)?.[0];
  assert.equal(expected, "go1.26.4");
  const html = readFileSync(resolve(root, "index.html"), "utf8");
  assert.match(html, /id="course-badge"[\s\S]*?>Go 1\.26\.4<\/span>/);
});

test("release text contains no common secrets or local user paths", () => {
  const forbidden = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/,
    /\b(?:api[_-]?key|password|secret)\s*[:=]\s*["'][^"']+["']/i,
    /\bC:\\Users\\[^\\\s]+\\/i,
    /\/Users\/[^/\s]+\//,
    /\/home\/(?!runner\b)[^/\s]+\//,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  ];
  for (const path of walk(root).filter((file) => textExtensions.has(extname(file)))) {
    const source = readFileSync(path, "utf8");
    for (const pattern of forbidden) {
      assert.doesNotMatch(source, pattern, relative(root, path));
    }
  }
});
